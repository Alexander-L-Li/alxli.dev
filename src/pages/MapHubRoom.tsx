import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  doc,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
  writeBatch,
  deleteField,
} from 'firebase/firestore';
import {
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  InfoWindowF,
  StandaloneSearchBox,
  DirectionsRenderer,
} from '@react-google-maps/api';
import type { Libraries } from '@react-google-maps/api';
import { db, auth } from '@/lib/firebase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  MapPin,
  Settings,
  Share2,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Check,
  Copy,
  ArrowUp,
  ArrowDown,
  Search,
  Plus,
  Eye,
  MessageSquare,
  Edit3,
  Sun,
  Moon,
  Star,
  Utensils,
  TreePine,
  Building2,
  Ticket,
  ShoppingBag,
  Route,
  Home,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
const LIBRARIES: Libraries = ['places'];

// Simplified rainbow palette — last entry handled by custom color input
const DEFAULT_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#a855f7', // violet
];

const MAP_STYLE = { width: '100%', height: '100%' };
const DEFAULT_CENTER = { lat: 35.6762, lng: 139.6503 };
const SIDEBAR_W = 300;

const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#373737' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#373737' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c3c3c' }] },
  { featureType: 'road.highway.controlled_access', elementType: 'geometry', stylers: [{ color: '#4e4e4e' }] },
  { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d3d3d' }] },
];

// ─── Categories ──────────────────────────────────────────────────────────────

type Category = 'landmark' | 'restaurant' | 'nature' | 'hotel' | 'entertainment' | 'shopping';

const CATEGORIES: { value: Category; label: string; icon: React.ElementType }[] = [
  { value: 'landmark', label: 'Landmark', icon: Star },
  { value: 'restaurant', label: 'Restaurant', icon: Utensils },
  { value: 'nature', label: 'Nature', icon: TreePine },
  { value: 'hotel', label: 'Hotel', icon: Building2 },
  { value: 'entertainment', label: 'Entertainment', icon: Ticket },
  { value: 'shopping', label: 'Shopping', icon: ShoppingBag },
];

function getCategoryMeta(category?: string) {
  return CATEGORIES.find((c) => c.value === category) ?? null;
}

// ─── Types ──────────────────────────────────────────────────────────────────

type Permission = 'edit' | 'comment' | 'view';

interface Room {
  name: string;
  numDays: number;
  ownerId: string;
  ownerName: string;
  defaultPermission: Permission;
  dayColors: string[];
  stayLocations?: Record<string, StayLocation>;
}

interface Pin {
  id: string;
  locationName: string;
  address: string;
  lat: number;
  lng: number;
  day: number;
  order: number;
  color: string;
  addedBy: string;
  notes: string;
  category?: string;
}

interface Member {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  permission: Permission | null;
}

interface PendingLocation {
  lat: number;
  lng: number;
  locationName: string;
  address: string;
}

interface StayLocation {
  locationName: string;
  address: string;
  lat: number;
  lng: number;
}

// ─── Route optimizer (nearest-neighbour TSP / Dijkstra-inspired) ─────────────
// Caller places the desired start pin at index 0; this function treats it as the anchor.

function optimizeRoute(pins: Pin[]): Pin[] {
  if (pins.length <= 1) return pins;
  const result: Pin[] = [pins[0]];
  const unvisited = pins.slice(1);
  let current = pins[0];
  while (unvisited.length > 0) {
    let minDist = Infinity;
    let nearestIdx = 0;
    for (let i = 0; i < unvisited.length; i++) {
      const dx = unvisited[i].lat - current.lat;
      const dy = unvisited[i].lng - current.lng;
      const dist = dx * dx + dy * dy;
      if (dist < minDist) { minDist = dist; nearestIdx = i; }
    }
    current = unvisited.splice(nearestIdx, 1)[0];
    result.push(current);
  }
  return result;
}

// Nearest-neighbour starting from an external origin (e.g. stay location)
function optimizeRouteFromOrigin(origin: { lat: number; lng: number }, pins: Pin[]): Pin[] {
  if (pins.length === 0) return [];
  // Find the pin closest to the origin first
  let minDist = Infinity;
  let nearestIdx = 0;
  for (let i = 0; i < pins.length; i++) {
    const dx = pins[i].lat - origin.lat;
    const dy = pins[i].lng - origin.lng;
    const d = dx * dx + dy * dy;
    if (d < minDist) { minDist = d; nearestIdx = i; }
  }
  const ordered = [pins[nearestIdx], ...pins.filter((_, i) => i !== nearestIdx)];
  return optimizeRoute(ordered);
}

// ─── AddPinModal ─────────────────────────────────────────────────────────────

interface AddPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (pin: Omit<Pin, 'id'>) => Promise<void>;
  numDays: number;
  dayColors: string[];
  selectedDay: number;
  allPins: Pin[];
  pending: PendingLocation;
  userName: string;
}

const AddPinModal: React.FC<AddPinModalProps> = ({
  isOpen, onClose, onAdd, numDays, dayColors, selectedDay, allPins, pending, userName,
}) => {
  const acRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [resolvedName, setResolvedName] = useState('');
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [resolvedLat, setResolvedLat] = useState<number | null>(null);
  const [resolvedLng, setResolvedLng] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [day, setDay] = useState(selectedDay);
  const [color, setColor] = useState(dayColors[selectedDay - 1] ?? DEFAULT_COLORS[0]);
  const [category, setCategory] = useState<Category | ''>('');
  const [loading, setLoading] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const hasLocation = pending.address !== '' || pending.locationName !== '';
    if (hasLocation) {
      setResolvedName(pending.locationName);
      setResolvedAddress(pending.address);
      setResolvedLat(pending.lat);
      setResolvedLng(pending.lng);
    } else {
      setResolvedName('');
      setResolvedAddress('');
      setResolvedLat(null);
      setResolvedLng(null);
    }
    setNotes('');
    setDay(selectedDay);
    setColor(dayColors[selectedDay - 1] ?? DEFAULT_COLORS[0]);
    setCategory('');
  }, [isOpen, pending, selectedDay, dayColors]);

  // Callback ref — fires the instant the search input mounts/unmounts in the Dialog portal
  const searchInputCallbackRef = useCallback((node: HTMLInputElement | null) => {
    if (acRef.current) {
      google.maps.event.clearInstanceListeners(acRef.current);
      acRef.current = null;
    }
    if (!node || !window.google?.maps?.places) return;
    const ac = new google.maps.places.Autocomplete(node, {
      fields: ['name', 'formatted_address', 'geometry'],
    });
    acRef.current = ac;
    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();
      if (lat != null && lng != null) {
        setResolvedName(place.name ?? '');
        setResolvedAddress(place.formatted_address ?? '');
        setResolvedLat(lat);
        setResolvedLng(lng);
      }
    });
  }, []);

  const handleDayChange = (d: number) => {
    setDay(d);
    setColor(dayColors[d - 1] ?? DEFAULT_COLORS[(d - 1) % DEFAULT_COLORS.length]);
  };

  const clearSelection = () => {
    setResolvedName('');
    setResolvedAddress('');
    setResolvedLat(null);
    setResolvedLng(null);
  };

  const isResolved = resolvedLat != null && resolvedLng != null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isResolved) return;
    setLoading(true);
    const nextOrder = allPins.filter((p) => p.day === day).length + 1;
    const displayName = resolvedName || resolvedAddress;
    await onAdd({
      locationName: displayName.trim(),
      address: resolvedAddress.trim(),
      lat: resolvedLat!,
      lng: resolvedLng!,
      day,
      order: nextOrder,
      color,
      addedBy: userName,
      notes: notes.trim(),
      ...(category ? { category } : {}),
    });
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <MapPin className="w-4 h-4 text-zinc-400" />
            Add Pin
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Place search */}
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">
              Search <span className="text-red-500">*</span>
            </label>
            {isResolved ? (
              <div className="flex items-start gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5">
                <MapPin className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  {resolvedName && (
                    <p className="text-sm text-white font-medium truncate">{resolvedName}</p>
                  )}
                  <p className="text-xs text-zinc-400 truncate">{resolvedAddress || resolvedName}</p>
                </div>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-zinc-500 hover:text-white transition-colors flex-shrink-0"
                  title="Change location"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <input
                ref={searchInputCallbackRef}
                type="text"
                placeholder="Search for a place…"
                autoFocus
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
              />
            )}
          </div>

          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Opening hours, tips, reservations…"
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Day</label>
            <select
              value={day}
              onChange={(e) => handleDayChange(parseInt(e.target.value))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
            >
              {Array.from({ length: numDays }, (_, i) => (
                <option key={i + 1} value={i + 1}>Day {i + 1}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Category</label>
            <div className="grid grid-cols-3 gap-1.5">
              {CATEGORIES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCategory(category === value ? '' : value)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs transition-colors',
                    category === value
                      ? 'border-white bg-white/10 text-white'
                      : 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                  )}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Pin Color</label>
            <div className="flex items-center gap-2">
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 flex-shrink-0"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? '#fff' : 'transparent',
                    outline: color === c ? '2px solid #3b82f6' : 'none',
                    outlineOffset: '1px',
                  }}
                />
              ))}
              {/* Custom color */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 overflow-hidden cursor-pointer flex items-center justify-center"
                  style={{
                    backgroundColor: DEFAULT_COLORS.includes(color) ? '#52525b' : color,
                    borderColor: !DEFAULT_COLORS.includes(color) ? '#fff' : 'transparent',
                    outline: !DEFAULT_COLORS.includes(color) ? '2px solid #3b82f6' : 'none',
                    outlineOffset: '1px',
                    backgroundImage: DEFAULT_COLORS.includes(color)
                      ? 'conic-gradient(red, orange, yellow, green, blue, indigo, violet, red)'
                      : 'none',
                  }}
                  title="Custom color"
                >
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    title="Custom color"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isResolved || loading}
              className="px-4 py-2 text-sm bg-white text-zinc-900 font-medium rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-40"
            >
              {loading ? 'Adding...' : 'Add Pin'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─── EditPinModal ─────────────────────────────────────────────────────────────

interface EditPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pinId: string, updates: Partial<Omit<Pin, 'id'>>) => Promise<void>;
  pin: Pin;
  numDays: number;
  dayColors: string[];
}

const EditPinModal: React.FC<EditPinModalProps> = ({ isOpen, onClose, onSave, pin, numDays, dayColors }) => {
  const acRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [locationName, setLocationName] = useState(pin.locationName);
  const [resolvedAddress, setResolvedAddress] = useState(pin.address);
  const [resolvedLat, setResolvedLat] = useState(pin.lat);
  const [resolvedLng, setResolvedLng] = useState(pin.lng);
  const [searching, setSearching] = useState(false);
  const [notes, setNotes] = useState(pin.notes);
  const [day, setDay] = useState(pin.day);
  const [color, setColor] = useState(pin.color);
  const [category, setCategory] = useState<Category | ''>(pin.category as Category | '' ?? '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocationName(pin.locationName);
      setResolvedAddress(pin.address);
      setResolvedLat(pin.lat);
      setResolvedLng(pin.lng);
      setSearching(false);
      setNotes(pin.notes);
      setDay(pin.day);
      setColor(pin.color);
      setCategory(pin.category as Category | '' ?? '');
    }
  }, [isOpen, pin]);

  // Callback ref — fires the instant the search input mounts when searching is true
  const searchInputCallbackRef = useCallback((node: HTMLInputElement | null) => {
    if (acRef.current) {
      google.maps.event.clearInstanceListeners(acRef.current);
      acRef.current = null;
    }
    if (!node || !window.google?.maps?.places) return;
    const ac = new google.maps.places.Autocomplete(node, {
      fields: ['name', 'formatted_address', 'geometry'],
    });
    acRef.current = ac;
    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();
      if (lat != null && lng != null) {
        setLocationName(place.name ?? place.formatted_address ?? '');
        setResolvedAddress(place.formatted_address ?? '');
        setResolvedLat(lat);
        setResolvedLng(lng);
        setSearching(false);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim()) return;
    setLoading(true);
    await onSave(pin.id, {
      locationName: locationName.trim(),
      address: resolvedAddress.trim(),
      lat: resolvedLat,
      lng: resolvedLng,
      notes: notes.trim(),
      day,
      color,
      ...(category ? { category } : { category: '' }),
    });
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Edit3 className="w-4 h-4 text-zinc-400" />
            Edit Pin
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Location */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-zinc-500">Location</label>
              {!searching && (
                <button
                  type="button"
                  onClick={() => setSearching(true)}
                  className="text-xs text-zinc-500 hover:text-white transition-colors"
                >
                  Change location
                </button>
              )}
            </div>
            {searching ? (
              <div className="space-y-1.5">
                <input
                  ref={searchInputCallbackRef}
                  type="text"
                  placeholder="Search for a new place…"
                  autoFocus
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => setSearching(false)}
                  className="text-xs text-zinc-500 hover:text-white transition-colors"
                >
                  Cancel search
                </button>
              </div>
            ) : (
              <div className="flex items-start gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5">
                <MapPin className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-400 truncate">{resolvedAddress || locationName}</p>
                </div>
              </div>
            )}
          </div>
          {/* Editable name */}
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              required
              autoFocus={!searching}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Opening hours, tips, reservations…"
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Day</label>
            <select
              value={day}
              onChange={(e) => { setDay(parseInt(e.target.value)); }}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
            >
              {Array.from({ length: numDays }, (_, i) => (
                <option key={i + 1} value={i + 1}>Day {i + 1}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Category</label>
            <div className="grid grid-cols-3 gap-1.5">
              {CATEGORIES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCategory(category === value ? '' : value)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs transition-colors',
                    category === value
                      ? 'border-white bg-white/10 text-white'
                      : 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                  )}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Pin Color</label>
            <div className="flex items-center gap-2">
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 flex-shrink-0"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? '#fff' : 'transparent',
                    outline: color === c ? '2px solid #3b82f6' : 'none',
                    outlineOffset: '1px',
                  }}
                />
              ))}
              <div className="relative flex-shrink-0">
                <div
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 overflow-hidden cursor-pointer"
                  style={{
                    backgroundColor: DEFAULT_COLORS.includes(color) ? '#52525b' : color,
                    borderColor: !DEFAULT_COLORS.includes(color) ? '#fff' : 'transparent',
                    outline: !DEFAULT_COLORS.includes(color) ? '2px solid #3b82f6' : 'none',
                    outlineOffset: '1px',
                    backgroundImage: DEFAULT_COLORS.includes(color)
                      ? 'conic-gradient(red, orange, yellow, green, blue, indigo, violet, red)'
                      : 'none',
                  }}
                >
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!locationName.trim() || loading}
              className="px-4 py-2 text-sm bg-white text-zinc-900 font-medium rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-40"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─── SetStayModal ─────────────────────────────────────────────────────────────

interface SetStayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (location: StayLocation, days: number[]) => Promise<void>;
  onClear: (days: number[]) => Promise<void>;
  room: Room;
  selectedDay: number;
}

const SetStayModal: React.FC<SetStayModalProps> = ({ isOpen, onClose, onSave, onClear, room, selectedDay }) => {
  const [picked, setPicked] = useState<StayLocation | null>(null);
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set([selectedDay]));
  const [saving, setSaving] = useState(false);
  const acRef = useRef<google.maps.places.Autocomplete | null>(null);

  const existingStay = room.stayLocations?.[String(selectedDay)] ?? null;

  useEffect(() => {
    if (!isOpen) return;
    setPicked(existingStay);
    setSelectedDays(new Set([selectedDay]));
  }, [isOpen, selectedDay]);

  // Callback ref: fires the instant the input mounts inside the Dialog portal,
  // avoiding the timing gap that breaks useEffect + useRef with Radix portals.
  const inputCallbackRef = useCallback((node: HTMLInputElement | null) => {
    // Clean up any previous instance
    if (acRef.current) {
      google.maps.event.clearInstanceListeners(acRef.current);
      acRef.current = null;
    }
    if (!node || !window.google?.maps?.places) return;

    const ac = new google.maps.places.Autocomplete(node, {
      types: ['establishment', 'geocode'],
    });
    acRef.current = ac;

    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();
      if (lat != null && lng != null) {
        setPicked({
          locationName: place.name ?? '',
          address: place.formatted_address ?? '',
          lat,
          lng,
        });
      }
    });

    // Float the pac-container above the Dialog overlay (z-index fix)
    setTimeout(() => {
      document.querySelectorAll<HTMLElement>('.pac-container').forEach((el) => {
        el.style.zIndex = '9999';
      });
    }, 100);
  }, []); // stable — setPicked from useState never changes

  const toggleDay = (d: number) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(d)) { if (next.size > 1) next.delete(d); } else { next.add(d); }
      return next;
    });
  };

  const handleSave = async () => {
    if (!picked) return;
    setSaving(true);
    await onSave(picked, Array.from(selectedDays));
    setSaving(false);
    onClose();
  };

  const handleClear = async () => {
    setSaving(true);
    await onClear(Array.from(selectedDays));
    setSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Card — no Radix focus trap so Google pac-container works */}
      <div className="relative z-50 bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-2 mb-5">
          <Home className="w-4 h-4 text-zinc-400" />
          <span className="font-semibold text-white">Place of Stay</span>
        </div>

        <div className="space-y-4">
          {/* Search */}
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Search hotel, Airbnb, address…</label>
            <input
              ref={inputCallbackRef}
              type="text"
              defaultValue={existingStay?.locationName ?? ''}
              placeholder="e.g. Shinjuku Granbell Hotel"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
            {picked && (
              <p className="text-[11px] text-green-400 mt-1.5 truncate">✓ {picked.locationName}{picked.address ? ` · ${picked.address}` : ''}</p>
            )}
          </div>

          {/* Day multi-select */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-zinc-500">Apply to days</label>
              <button
                type="button"
                onClick={() => setSelectedDays(new Set(Array.from({ length: room.numDays }, (_, i) => i + 1)))}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Select all
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: room.numDays }, (_, i) => i + 1).map((d) => {
                const active = selectedDays.has(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={cn(
                      'w-9 h-9 rounded-lg text-xs font-medium border transition-colors',
                      active ? 'text-white' : 'border-zinc-700 text-zinc-500 hover:border-zinc-600'
                    )}
                    style={active ? {
                      borderColor: room.dayColors[d - 1],
                      backgroundColor: room.dayColors[d - 1] + '33',
                      color: room.dayColors[d - 1],
                    } : {}}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 mt-6 flex-wrap">
          {existingStay && (
            <button
              type="button"
              onClick={handleClear}
              disabled={saving}
              className="text-xs text-red-400 hover:text-red-300 transition-colors px-3 py-2 mr-auto"
            >
              Clear
            </button>
          )}
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors ml-auto">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!picked || saving || selectedDays.size === 0}
            className="px-4 py-2 text-sm bg-white text-zinc-900 font-medium rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── SettingsModal ────────────────────────────────────────────────────────────

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  roomCode: string;
  members: Member[];
  onUpdateDefault: (p: Permission) => Promise<void>;
  onUpdateMember: (uid: string, p: Permission | null) => Promise<void>;
  onUpdateNumDays: (days: number) => Promise<void>;
}

const permissionLabel: Record<Permission, string> = {
  edit: 'Can edit',
  comment: 'Can comment',
  view: 'View only',
};

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose, room, roomCode, members, onUpdateDefault, onUpdateMember, onUpdateNumDays,
}) => {
  const [defaultPerm, setDefaultPerm] = useState<Permission>(room.defaultPermission);
  const [numDaysStr, setNumDaysStr] = useState(String(room.numDays));
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const shareUrl = `${window.location.origin}/maphub/${roomCode}`;

  useEffect(() => {
    setDefaultPerm(room.defaultPermission);
    setNumDaysStr(String(room.numDays));
  }, [room.defaultPermission, room.numDays]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    const newDays = Math.min(30, Math.max(1, parseInt(numDaysStr) || 1));
    const promises: Promise<void>[] = [onUpdateDefault(defaultPerm)];
    if (newDays !== room.numDays) promises.push(onUpdateNumDays(newDays));
    await Promise.all(promises);
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Settings className="w-4 h-4 text-zinc-400" />
            Room Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Room code + link */}
          <div className="space-y-3">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Room Code</p>
              <p className="font-mono text-2xl font-bold text-white tracking-widest">
                {roomCode}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1.5">Share Link</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-400 font-mono focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="w-9 flex items-center justify-center bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Default permission */}
          <div>
            <p className="text-xs text-zinc-500 mb-2">Default permission for new members</p>
            <div className="grid grid-cols-3 gap-2">
              {(['edit', 'comment', 'view'] as Permission[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setDefaultPerm(p)}
                  className={cn(
                    'flex flex-col items-center gap-1 py-2.5 rounded-lg border text-xs transition-colors',
                    defaultPerm === p
                      ? 'border-white bg-white/10 text-white'
                      : 'border-zinc-700 text-zinc-500 hover:border-zinc-600'
                  )}
                >
                  {p === 'edit' && <Edit3 className="w-3.5 h-3.5" />}
                  {p === 'comment' && <MessageSquare className="w-3.5 h-3.5" />}
                  {p === 'view' && <Eye className="w-3.5 h-3.5" />}
                  <span className="capitalize">{p}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Trip length */}
          <div>
            <p className="text-xs text-zinc-500 mb-2">Trip length</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={30}
                value={numDaysStr}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === '' || /^\d+$/.test(raw)) setNumDaysStr(raw);
                }}
                onBlur={() => {
                  const val = Math.min(30, Math.max(1, parseInt(numDaysStr) || 1));
                  setNumDaysStr(String(val));
                }}
                className="w-20 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
              />
              <span className="text-xs text-zinc-500">days (max 30)</span>
            </div>
          </div>

          {/* Members */}
          {members.length > 0 && (
            <div>
              <p className="text-xs text-zinc-500 mb-2">
                Members ({members.length})
              </p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {members.map((m) => (
                  <div
                    key={m.uid}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg bg-zinc-800"
                  >
                    {m.photoURL ? (
                      <img
                        src={m.photoURL}
                        alt={m.displayName}
                        className="w-7 h-7 rounded-full flex-shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-400 flex-shrink-0">
                        {m.displayName?.[0]?.toUpperCase() ?? '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{m.displayName}</p>
                      <p className="text-xs text-zinc-600 truncate">{m.email}</p>
                    </div>
                    <select
                      value={m.permission ?? 'default'}
                      onChange={(e) => {
                        const val = e.target.value;
                        onUpdateMember(m.uid, val === 'default' ? null : val as Permission);
                      }}
                      className="bg-zinc-700 border border-zinc-600 text-xs text-white rounded-md px-2 py-1 focus:outline-none focus:border-zinc-500"
                    >
                      <option value="default">Default</option>
                      <option value="edit">Can edit</option>
                      <option value="comment">Comment</option>
                      <option value="view">View only</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-white text-zinc-900 font-medium rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-40"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── MapHubRoom ───────────────────────────────────────────────────────────────

const MapHubRoom: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [room, setRoom] = useState<Room | null>(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomNotFound, setRoomNotFound] = useState(false);
  const [pins, setPins] = useState<Pin[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<PendingLocation | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [darkMap, setDarkMap] = useState(true);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showStayModal, setShowStayModal] = useState(false);
  const [optimizedPreview, setOptimizedPreview] = useState<Pin[] | null>(null);
  const [routeOrigin, setRouteOrigin] = useState<StayLocation | null>(null);
  const [directionsResult, setDirectionsResult] = useState<google.maps.DirectionsResult | null>(null);
  const [directionsRequest, setDirectionsRequest] = useState<{ pins: Pin[]; origin: StayLocation | null } | null>(null);
  const [routeComputing, setRouteComputing] = useState(false);
  const [editingPin, setEditingPin] = useState<Pin | null>(null);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const hasFitBoundsRef = useRef(false);


  // Auth
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
  }, []);

  // Redirect if not signed in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/maphub');
    }
  }, [authLoading, user, navigate]);

  const isOwner = user != null && room != null && user.uid === room.ownerId;

  const memberRecord = members.find((m) => m.uid === user?.uid);
  const effectivePermission: Permission = isOwner
    ? 'edit'
    : memberRecord?.permission ?? room?.defaultPermission ?? 'view';

  // Subscribe to room
  useEffect(() => {
    if (!roomCode) return;
    return onSnapshot(doc(db, 'rooms', roomCode), (snap) => {
      if (!snap.exists()) { setRoomNotFound(true); setRoomLoading(false); return; }
      setRoom(snap.data() as Room);
      setRoomLoading(false);
    });
  }, [roomCode]);

  // Subscribe to pins
  useEffect(() => {
    if (!roomCode) return;
    return onSnapshot(collection(db, 'rooms', roomCode, 'pins'), (snap) => {
      const loaded: Pin[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Pin, 'id'>) }));
      loaded.sort((a, b) => a.day - b.day || a.order - b.order);
      setPins(loaded);
    });
  }, [roomCode]);

  // Subscribe to members
  useEffect(() => {
    if (!roomCode) return;
    return onSnapshot(collection(db, 'rooms', roomCode, 'members'), (snap) => {
      setMembers(snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<Member, 'uid'>) })));
    });
  }, [roomCode]);

  // Track member on join
  useEffect(() => {
    if (!roomCode || !user) return;
    setDoc(
      doc(db, 'rooms', roomCode, 'members', user.uid),
      {
        displayName: user.displayName || user.email || 'User',
        email: user.email || '',
        photoURL: user.photoURL || '',
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );
  }, [roomCode, user]);

  // Record this room in the user's "My Trips" list
  useEffect(() => {
    if (!roomCode || !user || !room) return;
    setDoc(
      doc(db, 'users', user.uid, 'rooms', roomCode),
      {
        roomCode,
        name: room.name,
        numDays: room.numDays,
        isOwner: user.uid === room.ownerId,
        lastVisited: serverTimestamp(),
      },
      { merge: true }
    );
  }, [roomCode, user?.uid, room?.name, room?.numDays, room?.ownerId]);

  const handleMapLoad = useCallback((map: google.maps.Map) => setMapRef(map), []);

  // Fit map to all pins on initial load (fires once when both map and pins are ready)
  useEffect(() => {
    if (!mapRef || hasFitBoundsRef.current || pins.length === 0) return;
    hasFitBoundsRef.current = true;
    if (pins.length === 1) {
      mapRef.panTo({ lat: pins[0].lat, lng: pins[0].lng });
      mapRef.setZoom(14);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    pins.forEach((pin) => bounds.extend({ lat: pin.lat, lng: pin.lng }));
    mapRef.fitBounds(bounds, 80);
  }, [mapRef, pins]);

  // Fetch road-following route when a directions request is issued.
  // Depends only on directionsRequest (not optimizedPreview) to avoid infinite loops
  // when we update optimizedPreview from inside the callback.
  useEffect(() => {
    if (!directionsRequest) {
      setDirectionsResult(null);
      setRouteComputing(false);
      return;
    }
    if (!mapRef || directionsRequest.pins.length < 2) return;

    let cancelled = false;
    const { pins: reqPins, origin: reqOrigin } = directionsRequest;
    setDirectionsResult(null);
    setRouteComputing(true);

    // Fit map to all stops
    const bounds = new google.maps.LatLngBounds();
    if (reqOrigin) bounds.extend({ lat: reqOrigin.lat, lng: reqOrigin.lng });
    reqPins.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
    mapRef.fitBounds(bounds, 100);

    // Round-trip from stay if available (hotel → stops → hotel); otherwise first→last
    const origin = reqOrigin
      ? { lat: reqOrigin.lat, lng: reqOrigin.lng }
      : { lat: reqPins[0].lat, lng: reqPins[0].lng };
    const destination = reqOrigin
      ? { lat: reqOrigin.lat, lng: reqOrigin.lng }
      : { lat: reqPins[reqPins.length - 1].lat, lng: reqPins[reqPins.length - 1].lng };

    // Round-trip: all pins are waypoints; one-way: middle pins only
    const waypointPins = reqOrigin ? reqPins : reqPins.slice(1, -1);
    // Cap at 23 intermediate waypoints (Directions API limit)
    const capped = waypointPins.slice(0, 23);
    const waypoints = capped.map((p) => ({
      location: { lat: p.lat, lng: p.lng },
      stopover: true,
    }));

    new google.maps.DirectionsService().route(
      {
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      },
      (result, status) => {
        if (cancelled) return;
        setRouteComputing(false);
        if (status === 'OK' && result) {
          setDirectionsResult(result);
          // Reorder the preview to match Google's optimal waypoint order
          const order = result.routes[0]?.waypoint_order ?? [];
          const reordered = order.map((i) => capped[i]);
          setOptimizedPreview(
            reqOrigin
              ? reordered
              : [reqPins[0], ...reordered, reqPins[reqPins.length - 1]],
          );
        }
      },
    );

    return () => { cancelled = true; };
  }, [directionsRequest, mapRef]);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (effectivePermission !== 'edit') return;
      const lat = e.latLng?.lat();
      const lng = e.latLng?.lng();
      if (lat == null || lng == null) return;
      new google.maps.Geocoder().geocode({ location: { lat, lng } }, (results, status) => {
        setPendingLocation({
          lat, lng,
          locationName: '',
          address: status === 'OK' && results?.[0] ? results[0].formatted_address : '',
        });
        setShowAddModal(true);
      });
    },
    [effectivePermission]
  );

  const handleSearchPlaceSelected = useCallback(() => {
    const places = searchBoxRef.current?.getPlaces();
    if (!places?.length) return;
    const place = places[0];
    const lat = place.geometry?.location?.lat();
    const lng = place.geometry?.location?.lng();
    if (lat == null || lng == null) return;
    if (mapRef) { mapRef.panTo({ lat, lng }); mapRef.setZoom(14); }
    if (effectivePermission === 'edit') {
      setPendingLocation({ lat, lng, locationName: place.name ?? '', address: place.formatted_address ?? '' });
      setShowAddModal(true);
      if (searchInputRef.current) searchInputRef.current.value = '';
    }
  }, [mapRef, effectivePermission]);

  const handleAddPin = async (pinData: Omit<Pin, 'id'>) => {
    if (!roomCode) return;
    await addDoc(collection(db, 'rooms', roomCode, 'pins'), { ...pinData, addedAt: serverTimestamp() });
  };

  const handleDeletePin = async (pinId: string) => {
    if (!roomCode) return;
    await deleteDoc(doc(db, 'rooms', roomCode, 'pins', pinId));
    if (selectedPin?.id === pinId) setSelectedPin(null);
  };

  const handleUpdatePin = async (pinId: string, updates: Partial<Omit<Pin, 'id'>>) => {
    if (!roomCode) return;
    await updateDoc(doc(db, 'rooms', roomCode, 'pins', pinId), updates);
    // Keep selectedPin in sync
    if (selectedPin?.id === pinId) setSelectedPin((p) => p ? { ...p, ...updates } : p);
  };

  // Clear all pins for the selected day
  const handleClearDay = async () => {
    if (!roomCode) return;
    const dayPins = pins.filter((p) => p.day === selectedDay);
    if (dayPins.length === 0) return;
    if (!window.confirm(`Delete all ${dayPins.length} pin${dayPins.length !== 1 ? 's' : ''} for Day ${selectedDay}?`)) return;
    setClearing(true);
    const batch = writeBatch(db);
    dayPins.forEach((p) => batch.delete(doc(db, 'rooms', roomCode, 'pins', p.id)));
    await batch.commit();
    setSelectedPin(null);
    setClearing(false);
  };

  // Preview optimal route — show nearest-neighbour order immediately while Google computes
  const handleOptimizeRoute = () => {
    const dayPins = pins.filter((p) => p.day === selectedDay).sort((a, b) => a.order - b.order);
    if (dayPins.length < 2) return;
    const stay = room?.stayLocations?.[String(selectedDay)] ?? null;
    setRouteOrigin(stay);
    // Initial nearest-neighbour order shown immediately while Google's API responds
    let initialOrder: Pin[];
    if (stay) {
      initialOrder = optimizeRouteFromOrigin({ lat: stay.lat, lng: stay.lng }, dayPins);
    } else {
      const sorted = [...dayPins].sort((a, b) => b.lat - a.lat || a.lng - b.lng);
      initialOrder = optimizeRoute(sorted);
    }
    setOptimizedPreview(initialOrder);
    setDirectionsRequest({ pins: initialOrder, origin: stay });
  };

  // User approves preview — commit Google's optimized order to Firestore
  const handleApplyOptimizedOrder = async () => {
    if (!roomCode || !optimizedPreview) return;
    setOptimizing(true);
    const batch = writeBatch(db);
    optimizedPreview.forEach((pin, i) => {
      batch.update(doc(db, 'rooms', roomCode, 'pins', pin.id), { order: i + 1 });
    });
    await batch.commit();
    setOptimizedPreview(null);
    setRouteOrigin(null);
    setDirectionsRequest(null);
    setDirectionsResult(null);
    setOptimizing(false);
  };

  const handleCancelOptimize = () => {
    setOptimizedPreview(null);
    setRouteOrigin(null);
    setDirectionsRequest(null);
    setDirectionsResult(null);
  };

  // Save a stay location for one or more days
  const handleSetStayLocation = async (location: StayLocation, days: number[]) => {
    if (!roomCode) return;
    const updates: Record<string, StayLocation> = {};
    days.forEach((d) => { updates[`stayLocations.${d}`] = location; });
    await updateDoc(doc(db, 'rooms', roomCode), updates);
  };

  // Clear stay location for one or more days
  const handleClearStayLocation = async (days: number[]) => {
    if (!roomCode) return;
    const updates: Record<string, unknown> = {};
    days.forEach((d) => { updates[`stayLocations.${d}`] = deleteField(); });
    await updateDoc(doc(db, 'rooms', roomCode), updates);
  };

  const handleReorder = async (pinId: string, direction: 'up' | 'down') => {
    if (!roomCode) return;
    const pin = pins.find((p) => p.id === pinId);
    if (!pin) return;
    const dayPins = pins.filter((p) => p.day === pin.day).sort((a, b) => a.order - b.order);
    const idx = dayPins.findIndex((p) => p.id === pinId);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= dayPins.length) return;
    const swapPin = dayPins[swapIdx];
    await Promise.all([
      updateDoc(doc(db, 'rooms', roomCode, 'pins', pin.id), { order: swapPin.order }),
      updateDoc(doc(db, 'rooms', roomCode, 'pins', swapPin.id), { order: pin.order }),
    ]);
  };

  const handleUpdateDefault = async (p: Permission) => {
    if (!roomCode) return;
    await updateDoc(doc(db, 'rooms', roomCode), { defaultPermission: p });
  };

  const handleUpdateNumDays = async (days: number) => {
    if (!roomCode || !room) return;
    const currentColors = room.dayColors;
    let newColors = [...currentColors];
    if (days > currentColors.length) {
      for (let i = currentColors.length; i < days; i++) {
        newColors.push(DEFAULT_COLORS[i % DEFAULT_COLORS.length]);
      }
    } else {
      newColors = newColors.slice(0, days);
    }
    await updateDoc(doc(db, 'rooms', roomCode), { numDays: days, dayColors: newColors });
  };

  // Clamp selectedDay if numDays decreases
  useEffect(() => {
    if (room && selectedDay > room.numDays) setSelectedDay(room.numDays);
  }, [room?.numDays]);

  const handleUpdateMember = async (uid: string, p: Permission | null) => {
    if (!roomCode) return;
    await updateDoc(doc(db, 'rooms', roomCode, 'members', uid), { permission: p });
  };

  const handleAddPinFromSidebar = () => {
    const center = mapRef?.getCenter();
    setPendingLocation({
      lat: center?.lat() ?? DEFAULT_CENTER.lat,
      lng: center?.lng() ?? DEFAULT_CENTER.lng,
      locationName: '',
      address: '',
    });
    setShowAddModal(true);
  };

  const pinsForDay = pins.filter((p) => p.day === selectedDay).sort((a, b) => a.order - b.order);
  const dayColors = room?.dayColors ?? [];

  // ── Loading states ──────────────────────────────────────────────────────

  if (authLoading || roomLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (roomNotFound || !room) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-center px-4">
        <div>
          <MapPin className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Room not found</h2>
          <p className="text-zinc-500 text-sm mb-6">
            <span className="font-mono text-zinc-400">{roomCode}</span> doesn't exist.
          </p>
          <button
            onClick={() => navigate('/maphub')}
            className="bg-white text-zinc-900 font-medium rounded-lg px-4 py-2 text-sm hover:bg-zinc-100 transition-colors"
          >
            Back to MapHub
          </button>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-red-400 text-sm">Failed to load Google Maps.</p>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-zinc-950">
      {/* Top Bar */}
      <div className="h-12 bg-zinc-950 border-b border-zinc-800/80 flex items-center px-3 gap-2 z-20 flex-shrink-0">
        <button
          onClick={() => navigate('/maphub')}
          className="flex items-center gap-1 text-zinc-500 hover:text-white transition-colors text-sm px-2 py-1 rounded hover:bg-zinc-800"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:block text-xs">MapHub</span>
        </button>

        <div className="w-px h-4 bg-zinc-800" />

        <span className="text-white text-sm font-medium truncate max-w-[120px] sm:max-w-[180px]">
          {room.name}
        </span>

        {/* Day tabs */}
        <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide mx-2 min-w-0">
          {Array.from({ length: room.numDays }, (_, i) => i + 1).map((d) => (
            <button
              key={d}
              onClick={() => {
                setSelectedDay(d);
                setOptimizedPreview(null);
                setRouteOrigin(null);
                setDirectionsRequest(null);
                const stay = room.stayLocations?.[String(d)];
                if (stay && mapRef) { mapRef.panTo({ lat: stay.lat, lng: stay.lng }); mapRef.setZoom(13); }
              }}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all flex-shrink-0',
                selectedDay === d ? 'text-white' : 'text-zinc-600 hover:text-zinc-300'
              )}
              style={selectedDay === d ? { backgroundColor: dayColors[d - 1] + '33', color: dayColors[d - 1] } : {}}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: dayColors[d - 1] }}
              />
              <span className="hidden sm:inline">Day </span>{d}
              {pins.filter((p) => p.day === d).length > 0 && (
                <span className="ml-0.5 text-[10px] opacity-50">{pins.filter((p) => p.day === d).length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Permission badge */}
        <div className="hidden sm:flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-zinc-900 text-zinc-500 border border-zinc-800 flex-shrink-0">
          {effectivePermission === 'edit' && <Edit3 className="w-3 h-3" />}
          {effectivePermission === 'comment' && <MessageSquare className="w-3 h-3" />}
          {effectivePermission === 'view' && <Eye className="w-3 h-3" />}
          <span className="capitalize">{effectivePermission}</span>
        </div>

        <button
          onClick={() => setDarkMap((v) => !v)}
          className="text-zinc-500 hover:text-white transition-colors p-1.5 rounded hover:bg-zinc-800 flex-shrink-0"
          title={darkMap ? 'Switch to standard map' : 'Switch to dark map'}
        >
          {darkMap ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="text-zinc-500 hover:text-white transition-colors p-1.5 rounded hover:bg-zinc-800"
          title="Copy share link"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Share2 className="w-3.5 h-3.5" />}
        </button>

        {isOwner && (
          <button
            onClick={() => setShowSettings(true)}
            className="text-zinc-500 hover:text-white transition-colors p-1.5 rounded hover:bg-zinc-800"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Sidebar */}
        <div
          className="h-full bg-zinc-900 flex flex-col z-10 flex-shrink-0 transition-all duration-200 overflow-hidden border-r border-zinc-800/60"
          style={{ width: sidebarOpen ? SIDEBAR_W : 0 }}
        >
          {/* Search */}
          <div className="p-2.5 border-b border-zinc-800/60 flex-shrink-0">
            {isLoaded ? (
              <StandaloneSearchBox
                onLoad={(ref) => (searchBoxRef.current = ref)}
                onPlacesChanged={handleSearchPlaceSelected}
              >
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={effectivePermission === 'edit' ? 'Search to add a pin...' : 'Search to navigate...'}
                    className="w-full bg-zinc-800 text-white placeholder-zinc-600 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600 border border-zinc-700/50"
                  />
                </div>
              </StandaloneSearchBox>
            ) : (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-700" />
                <input disabled placeholder="Loading..." className="w-full bg-zinc-800 text-zinc-600 rounded-lg pl-8 pr-3 py-2 text-sm border border-zinc-700/50" />
              </div>
            )}
          </div>

          {/* Day header */}
          <div className="border-b border-zinc-800/60 flex-shrink-0">
            {/* Top row: day label + stop count + clear */}
            <div className="px-3 pt-2 pb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dayColors[selectedDay - 1] }} />
              <span className="text-xs font-medium text-zinc-300">Day {selectedDay}</span>
              {optimizedPreview
                ? <span className="text-[10px] text-blue-400 font-medium">· preview order</span>
                : <span className="text-zinc-700 text-xs">· {pinsForDay.length} stop{pinsForDay.length !== 1 ? 's' : ''}</span>
              }
              {effectivePermission === 'edit' && pinsForDay.length > 0 && !optimizedPreview && (
                <button
                  onClick={handleClearDay}
                  disabled={clearing}
                  className="ml-auto text-zinc-600 hover:text-red-400 transition-colors p-0.5 rounded"
                  title={`Clear all pins for Day ${selectedDay}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {/* Place of stay row */}
            {(() => {
              const stay = room.stayLocations?.[String(selectedDay)];
              if (stay) {
                return (
                  <div className="px-3 pb-2 flex items-center gap-1.5">
                    <Home className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    <span className="text-[11px] text-amber-300/80 truncate flex-1">{stay.locationName}</span>
                    {effectivePermission === 'edit' && (
                      <button
                        onClick={() => setShowStayModal(true)}
                        className="text-zinc-600 hover:text-zinc-300 transition-colors p-0.5 rounded flex-shrink-0"
                        title="Edit place of stay"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              }
              if (effectivePermission === 'edit') {
                return (
                  <button
                    onClick={() => setShowStayModal(true)}
                    className="px-3 pb-2 flex items-center gap-1 text-[11px] text-zinc-700 hover:text-zinc-400 transition-colors"
                  >
                    <Home className="w-3 h-3" />
                    Set place of stay
                  </button>
                );
              }
              return null;
            })()}
          </div>

          {/* Pin list */}
          <div className="flex-1 overflow-y-auto">
            {pinsForDay.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-700 text-xs px-4 text-center py-8 gap-2">
                <MapPin className="w-6 h-6 opacity-30" />
                {effectivePermission === 'edit'
                  ? `Click the map or search to add pins for Day ${selectedDay}`
                  : `No stops for Day ${selectedDay} yet`}
              </div>
            ) : (
              <ul>
                {(optimizedPreview ?? pinsForDay).map((pin, idx) => {
                  const catMeta = getCategoryMeta(pin.category);
                  const CatIcon = catMeta?.icon;
                  const isPreview = !!optimizedPreview;
                  const displayOrder = isPreview ? idx + 1 : pin.order;
                  return (
                    <li
                      key={pin.id}
                      onClick={() => {
                        if (!isPreview) {
                          setSelectedPin(selectedPin?.id === pin.id ? null : pin);
                          if (mapRef) { mapRef.panTo({ lat: pin.lat, lng: pin.lng }); mapRef.setZoom(15); }
                        }
                      }}
                      className={cn(
                        'flex items-start gap-2.5 px-3 py-2.5 transition-colors border-b border-zinc-800/40',
                        !isPreview && (selectedPin?.id === pin.id ? 'bg-zinc-800 cursor-pointer' : 'hover:bg-zinc-800/50 cursor-pointer'),
                        isPreview && 'cursor-default opacity-80',
                      )}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: pin.color }}
                      >
                        {displayOrder}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-white text-xs font-medium truncate">{pin.locationName}</p>
                          {CatIcon && (
                            <CatIcon className="w-3 h-3 text-zinc-500 flex-shrink-0" title={catMeta.label} />
                          )}
                        </div>
                        {pin.address && <p className="text-zinc-600 text-[11px] truncate mt-0.5">{pin.address}</p>}
                        {pin.notes && <p className="text-zinc-500 text-[10px] truncate mt-0.5 italic">{pin.notes}</p>}
                        {pin.addedBy && <p className="text-zinc-700 text-[10px] mt-0.5">by {pin.addedBy}</p>}
                      </div>
                      {effectivePermission === 'edit' && !isPreview && (
                        <div className="flex flex-col gap-0.5 flex-shrink-0 pt-0.5">
                          <button onClick={(e) => { e.stopPropagation(); handleReorder(pin.id, 'up'); }} disabled={idx === 0} className="text-zinc-700 hover:text-zinc-300 disabled:opacity-20 p-0.5">
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleReorder(pin.id, 'down'); }} disabled={idx === pinsForDay.length - 1} className="text-zinc-700 hover:text-zinc-300 disabled:opacity-20 p-0.5">
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setEditingPin(pin); }} className="text-zinc-700 hover:text-zinc-300 p-0.5">
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeletePin(pin.id); }} className="text-zinc-700 hover:text-red-400 p-0.5">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {effectivePermission === 'edit' && (
            <div className="p-2.5 border-t border-zinc-800/60 flex-shrink-0 space-y-1.5">
              {/* Preview approval buttons */}
              {optimizedPreview ? (
                <>
                  {routeComputing && (
                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 py-1">
                      <div className="w-3 h-3 border border-zinc-600 border-t-blue-400 rounded-full animate-spin flex-shrink-0" />
                      Computing optimal route…
                    </div>
                  )}
                  <button
                    onClick={handleApplyOptimizedOrder}
                    disabled={optimizing || routeComputing}
                    className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {optimizing ? 'Applying...' : 'Apply Order'}
                  </button>
                  <button
                    onClick={handleCancelOptimize}
                    className="w-full flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 rounded-lg py-2 text-xs font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  {/* Optimize route — 2+ pins; auto-uses place of stay as origin */}
                  {pinsForDay.length >= 2 && (
                    <button
                      onClick={handleOptimizeRoute}
                      className="w-full flex items-center justify-center gap-1.5 bg-zinc-800/60 hover:bg-zinc-700/60 border border-zinc-700/60 text-zinc-300 rounded-lg py-2 text-xs font-medium transition-colors"
                      title={room.stayLocations?.[String(selectedDay)] ? 'Optimize route from your place of stay (round trip)' : 'Optimize visit order via Google Maps routing'}
                    >
                      <Route className="w-3.5 h-3.5" />
                      Optimize Route
                    </button>
                  )}
                  <button
                    onClick={handleAddPinFromSidebar}
                    className="w-full flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-lg py-2 text-xs font-medium transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Pin
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="absolute top-1/2 -translate-y-1/2 z-20 bg-zinc-900 border border-zinc-800 text-zinc-600 hover:text-white p-0.5 rounded-r transition-all"
          style={{ left: sidebarOpen ? SIDEBAR_W : 0 }}
        >
          {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {/* Map */}
        <div className="flex-1 h-full">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={MAP_STYLE}
              center={DEFAULT_CENTER}
              zoom={4}
              onLoad={handleMapLoad}
              onClick={handleMapClick}
              options={{
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: !darkMap,
                streetViewControl: false,
                fullscreenControl: false,
                clickableIcons: !darkMap,
                styles: darkMap ? DARK_MAP_STYLES : [],
              }}
            >
              {(() => {
                const previewOrderMap = optimizedPreview
                  ? new Map(optimizedPreview.map((p, i) => [p.id, i + 1]))
                  : null;
                return pins.map((pin) => {
                  const displayOrder = previewOrderMap?.get(pin.id) ?? pin.order;
                  const isFirst = previewOrderMap && previewOrderMap.get(pin.id) === 1;
                  return (
                    <MarkerF
                      key={pin.id}
                      position={{ lat: pin.lat, lng: pin.lng }}
                      onClick={() => setSelectedPin(selectedPin?.id === pin.id ? null : pin)}
                      icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: pin.color,
                        fillOpacity: 1,
                        strokeColor: isFirst ? '#ffffff' : '#111111',
                        strokeWeight: isFirst ? 3 : 2,
                        scale: selectedPin?.id === pin.id ? 13 : isFirst ? 12 : pin.day === selectedDay ? 10 : 7,
                      }}
                      label={pin.day === selectedDay ? {
                        text: String(displayOrder),
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: 'bold',
                      } : undefined}
                      opacity={pin.day === selectedDay ? 1 : 0.35}
                      zIndex={pin.day === selectedDay ? (isFirst ? 20 : 10) : 1}
                    />
                  );
                });
              })()}

              {/* Road-following route preview via DirectionsRenderer (exact Google Maps style) */}
              {optimizedPreview && directionsResult && (
                <DirectionsRenderer
                  directions={directionsResult}
                  options={{
                    suppressMarkers: true,
                    polylineOptions: {
                      strokeColor: '#4285F4',
                      strokeWeight: 6,
                      strokeOpacity: 0.9,
                      zIndex: 6,
                    },
                  }}
                />
              )}

              {/* Place of stay marker for selected day */}
              {(() => {
                const stay = room.stayLocations?.[String(selectedDay)];
                if (!stay) return null;
                return (
                  <MarkerF
                    position={{ lat: stay.lat, lng: stay.lng }}
                    title={stay.locationName}
                    zIndex={25}
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      fillColor: '#f59e0b',
                      fillOpacity: 1,
                      strokeColor: '#ffffff',
                      strokeWeight: 2.5,
                      scale: 11,
                    }}
                    label={{ text: '⌂', color: '#ffffff', fontSize: '14px' }}
                  />
                );
              })()}

              {selectedPin && (
                <InfoWindowF
                  position={{ lat: selectedPin.lat, lng: selectedPin.lng }}
                  onCloseClick={() => setSelectedPin(null)}
                  options={{ pixelOffset: new google.maps.Size(0, -12) }}
                >
                  <div className="p-1 min-w-[150px] max-w-[220px]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: selectedPin.color }} />
                      <p className="font-semibold text-gray-900 text-sm leading-tight">{selectedPin.locationName}</p>
                    </div>
                    {selectedPin.category && (
                      <p className="text-gray-500 text-xs mb-1 capitalize">
                        {getCategoryMeta(selectedPin.category)?.label ?? selectedPin.category}
                      </p>
                    )}
                    {selectedPin.address && <p className="text-gray-500 text-xs mb-1">{selectedPin.address}</p>}
                    {selectedPin.notes && <p className="text-gray-500 text-xs mb-1 italic">{selectedPin.notes}</p>}
                    <p className="text-gray-400 text-xs">Day {selectedPin.day} · Stop {selectedPin.order}</p>
                    {selectedPin.addedBy && <p className="text-gray-400 text-xs mt-0.5">by {selectedPin.addedBy}</p>}
                    {effectivePermission === 'edit' && (
                      <div className="mt-2 flex items-center gap-3">
                        <button
                          onClick={() => setEditingPin(selectedPin)}
                          className="flex items-center gap-1 text-zinc-500 text-xs hover:text-zinc-700"
                        >
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeletePin(selectedPin.id)}
                          className="flex items-center gap-1 text-red-500 text-xs hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </InfoWindowF>
              )}
            </GoogleMap>
          ) : (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {pendingLocation && (
        <AddPinModal
          isOpen={showAddModal}
          onClose={() => { setShowAddModal(false); setPendingLocation(null); }}
          onAdd={handleAddPin}
          numDays={room.numDays}
          dayColors={dayColors}
          selectedDay={selectedDay}
          allPins={pins}
          pending={pendingLocation}
          userName={user?.displayName || user?.email || 'Anonymous'}
        />
      )}

      <SetStayModal
        isOpen={showStayModal}
        onClose={() => setShowStayModal(false)}
        onSave={handleSetStayLocation}
        onClear={handleClearStayLocation}
        room={room}
        selectedDay={selectedDay}
      />

      {editingPin && (
        <EditPinModal
          isOpen={!!editingPin}
          onClose={() => setEditingPin(null)}
          onSave={handleUpdatePin}
          pin={editingPin}
          numDays={room.numDays}
          dayColors={dayColors}
        />
      )}

      {isOwner && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          room={room}
          roomCode={roomCode!}
          members={members.filter((m) => m.uid !== user?.uid)}
          onUpdateDefault={handleUpdateDefault}
          onUpdateMember={handleUpdateMember}
          onUpdateNumDays={handleUpdateNumDays}
        />
      )}
    </div>
  );
};

export default MapHubRoom;
