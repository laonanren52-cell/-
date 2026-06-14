import { useState } from "react";
import type { ReactNode } from "react";
import type { ImageSource } from "../../types";

type LifeCardImageProps = {
  imageUrl?: string;
  imageSource?: ImageSource;
  title?: string;
  className?: string;
  children?: ReactNode;
};

export function LifeCardImage({ imageUrl, imageSource, title, className = "", children }: LifeCardImageProps) {
  const [failed, setFailed] = useState(false);
  const shouldShowImage = Boolean(imageUrl && !failed);

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-blush via-cream to-skysoft ${className}`}>
      {shouldShowImage ? (
        <img
          src={imageUrl}
          alt={title || "人生卡图片"}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <DefaultTexture imageSource={imageSource} />
      )}
      {children}
    </div>
  );
}

function DefaultTexture({ imageSource: _imageSource }: { imageSource?: ImageSource }) {
  return (
    <>
      <div className="absolute right-[-20%] top-[-20%] h-64 w-64 rounded-full bg-white/45 blur-2xl" />
      <div className="absolute bottom-[-18%] left-[-12%] h-72 w-72 rounded-full bg-coral/15 blur-2xl" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5" />
    </>
  );
}
