import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Register from "./components/Register";
import ShopperDashboard from "./components/ShopperDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./components/AdminDashboard";

interface UserState {
  username: string;
  role: "admin" | "shopper";
  token: string;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainAppContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

function MainAppContent() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"login" | "register">("login");

  // Read login details directly from TanStack query store
  const { data: user, isLoading: checkingAuth } = useQuery<UserState | null>({
    queryKey: ["currentUser"],
    queryFn: () => {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    },
    staleTime: Infinity,
  });

  console.log('user',user);

  const handleLoginSuccess = (d:{
    token:string,
    user:UserState
  }) => {
    localStorage.setItem("token", d.token);
    localStorage.setItem("user", JSON.stringify(d.user));
    queryClient.setQueryData(["currentUser"], d.user);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    queryClient.setQueryData(["currentUser"], null);
  };

  if (checkingAuth) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-50 text-slate-900 antialiased">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-slate-200 border-t-sky-600" />
        <p className="text-sm font-medium text-slate-500 tracking-wide">
          Loading Session...
        </p>
      </div>
    );
  }

  const authFallback =
    view === "login" ? (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onNavigateToRegister={() => setView("register")}
      />
    ) : (
      <Register
        onRegisterSuccess={handleLoginSuccess}
        onNavigateToLogin={() => setView("login")}
      />
    );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <Navbar user={user || null} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProtectedRoute
          user={user || null}
          allowedRoles={user?.role ? [user.role] : []}
          fallback={authFallback}
        >
          {user?.role === "admin" ? <AdminDashboard /> : <ShopperDashboard />}
        </ProtectedRoute>
      </main>
    </div>
  );
}