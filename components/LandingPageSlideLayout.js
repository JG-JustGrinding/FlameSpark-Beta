"use client";
import Image from "next/image";
import "@/styles/LandingPage.css";

// headers and contents should be arrays of equal length.
// Provide an onContinue callback prop if you want a continue button rendered.
export default function LandingPageSlideLayout({
  index = 0,
  title = "",
  headers = [],
  contents = [],
  image = null,
  onContinue
}) {
  const showSections = headers.length === contents.length && headers.length > 0;

  const renderSections = () => {
    if (!showSections) return (
      (headers.length !== contents.length) ? (
        <p className="bodyFont" style={{ opacity: 0.7 }}>Content mismatch: headers and contents length differ.</p>
      ) : null
    );
    return headers.map((header, i) => (
      <div key={i} className="section-container">
        {header && <h3 className="titleFont">{header}</h3>}
        <p className="bodyFont">{contents[i]}</p>
      </div>
    ));
  };

  return (
    <div className={`slide-layout slide-layout-${index} ${index === 2 ? 'centered' : ''}`}>
      {title && <h2 className="titleFont">{title}</h2>}

      {/* Layout 0: Text left, Image right (default) */}
      {index === 0 && (
        <div className="content-row">
          <div className="text-col">
            {renderSections()}
            {onContinue && (
              <div className="continue-button-container">
                <button className="bodyFont button-shape red-color full-round" onClick={onContinue}>Click to Continue &gt;&gt;</button>
              </div>
            )}
          </div>
          {image && (
            <div className="image-col">
              <div className="image-wrapper">
                {typeof image === "string" ? (
                  <Image src={image} alt={title || "slide image"} width={400} height={300} />
                ) : image}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Layout 1: Image left, Text right (reversed row) */}
      {index === 1 && (
        <div className="content-row reverse">
          <div className="text-col">
            {renderSections()}
            {onContinue && (
              <div className="continue-button-container">
                <button className="bodyFont button-shape red-color full-round" onClick={onContinue}>Click to Continue &gt;&gt;</button>
              </div>
            )}
          </div>
          {image && (
            <div className="image-col">
              <div className="image-wrapper">
                {typeof image === "string" ? (
                  <Image src={image} alt={title || "slide image"} width={400} height={300} />
                ) : image}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Layout 2: Stacked, centered content with image below */}
      {index === 2 && (
        <div className="stacked">
          {renderSections()}
          {image && (
            <div className="image-wrapper" style={{ marginTop: 16 }}>
              {typeof image === "string" ? (
                <Image src={image} alt={title || "slide image"} width={500} height={360} />
              ) : image}
            </div>
          )}
          {onContinue && (
            <div className="continue-button-container" style={{ marginTop: 8 }}>
              <button className="bodyFont button-shape red-color full-round" onClick={onContinue}>Click to Continue &gt;&gt;</button>
            </div>
          )}
        </div>
      )}

      {/* Layout 3: Feature grid cards */}
      {index === 3 && (
        <>
          {image && (
            <div className="image-wrapper" style={{ marginBottom: 16 }}>
              {typeof image === "string" ? (
                <Image src={image} alt={title || "slide image"} width={460} height={320} />
              ) : image}
            </div>
          )}
          <div className="feature-grid">
            {showSections ? (
              headers.map((header, i) => (
                <div key={i} className="feature-card">
                  {header && <h3 className="titleFont">{header}</h3>}
                  <p className="bodyFont">{contents[i]}</p>
                </div>
              ))
            ) : (
              (headers.length !== contents.length) ? (
                <p className="bodyFont" style={{ opacity: 0.7 }}>Content mismatch: headers and contents length differ.</p>
              ) : null
            )}
          </div>
          {onContinue && (
            <div className="continue-button-container" style={{ marginTop: 16 }}>
              <button className="bodyFont button-shape red-color full-round" onClick={onContinue}>Click to Continue &gt;&gt;</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}