import PanelOverlay from "@/components/PanelOverlay";
import Link from "next/link";
import "./SignupNotice.css";

export default function SignupNotice({
  isOpen,
  onClose,
  title = "Join the FlameSpark-Beta Community!",
  message = "To gain full access to FlameSpark-Beta, please log in or create an account.",
  showLogo = true,
  loginHref = "/login",
  signupHref = "/signup",
  loginText = "Login",
  signupText = "Create Account",
  disableClose = false,
  panelClass = "create-page-login-notice",
  messageIndex = -1 // for using the same message in multiple places
}) {

  function getMessageByIndex(index) {
    const messages = [
      "To gain full access to FlameSpark-Beta and create projects, please log in or create an account.",
      "Log in or create an account to become a beta tester for FlameSpark and access exclusive features!"
    ];

    if (index >= 0 && index < messages.length) {
      return messages[index];
    }

    return message;
  }

  return (
    <PanelOverlay isOpen={isOpen} onClose={onClose} disableClose={disableClose} panelClass={panelClass}>
      <div className="create-page-login-notice-header">
        {showLogo && (
          <img src="/logo_no_text_compressed.png" alt="FlameSpark" className="create-page-login-notice-logo" />
        )}
        <h3 className="titleFont">{title}</h3>
      </div>
      <div className="create-page-login-notice-content bodyFont">
        <p>{getMessageByIndex(messageIndex)}</p>
        <div className="create-page-login-notice-actions bold">
          <Link href={loginHref} className="button-shape secondary">{loginText}</Link>
          <Link href={signupHref} className="button-shape primary">{signupText}</Link>
        </div>
      </div>
    </PanelOverlay>
  );
}
