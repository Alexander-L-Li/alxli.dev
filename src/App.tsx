import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SinglePageLayout from "./pages/SinglePageLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Router>
      <Routes>
        <Route path="/" element={<SinglePageLayout />} />
        <Route path="/projects" element={<SinglePageLayout />} />
        <Route path="/research" element={<SinglePageLayout />} />
        <Route path="/resume" element={<SinglePageLayout />} />
        <Route path="/notfound" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  </QueryClientProvider>
);

export default App;
