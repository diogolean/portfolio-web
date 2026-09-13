import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const hex = "polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#07090c",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 118,
            height: 102,
            background: "#00ff66",
            clipPath: hex,
          }}
        />
        <div
          style={{
            position: "absolute",
            display: "flex",
            width: 76,
            height: 66,
            background: "#04140c",
            clipPath: hex,
          }}
        />
        <div
          style={{
            position: "absolute",
            display: "flex",
            width: 36,
            height: 31,
            background: "#00ff66",
            clipPath: hex,
          }}
        />
      </div>
    ),
    size
  );
}
