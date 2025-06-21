import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SinglePageLayout from "./components/SinglePageLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SinglePageLayout />} />
        <Route path="/projects" element={<SinglePageLayout />} />
        <Route path="/research" element={<SinglePageLayout />} />
        <Route path="/resume" element={<SinglePageLayout />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
