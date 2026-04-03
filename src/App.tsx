import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Research from "./pages/Research";
import NotFound from "./pages/NotFound";
import MapHub from "./pages/MapHub";
import MapHubRoom from "./pages/MapHubRoom";
import ChessPage from "./pages/Chess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/projects"
          element={
            <Layout>
              <Projects />
            </Layout>
          }
        />
        <Route
          path="/research"
          element={
            <Layout>
              <Research />
            </Layout>
          }
        />

        <Route path="/maphub" element={<MapHub />} />
        <Route path="/maphub/:roomCode" element={<MapHubRoom />} />
        <Route path="/chess" element={<ChessPage />} />

        <Route
          path="*"
          element={
            <Layout>
              <NotFound />
            </Layout>
          }
        />
      </Routes>
    </Router>
  </QueryClientProvider>
);

export default App;
