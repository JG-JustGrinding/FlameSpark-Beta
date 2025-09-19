import "@/styles/PrimaryPage.css";
import Header from "./Header";
import SidePanel from "./SidePanel";

const Layout = ({ children, useTitle = true, title = "", description = "", noContainerPadding = false }) => {
  return (
<>
      <Header />

      <main className="main-container">
        <SidePanel />
        <div className={`container ${noContainerPadding ? "container-no-padding" : "container"}`}>
          {useTitle && <div className="title">
            <h1 className="titleFont header-size">{title}</h1>
            <p className="bodyFont body-size label-color">{description}</p>
          </div> }
          {children}
        </div>
      </main>
</>
  );
};

export default Layout;