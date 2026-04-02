import { Navigate } from "react-router-dom";

/**
 * LandingPage now redirects to HomePage.
 * The original landing content (hero, features, CTA) is replaced
 * by the full 포착TV home experience at /home.
 */
export default function LandingPage() {
  return <Navigate to="/home" replace />;
}
