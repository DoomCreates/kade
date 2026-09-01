export const metadata = {
  title: "kirby admin panel",
  description: "doom panel access",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#000",
          color: "#fff",
          fontFamily: "system-ui",
        }}
      >
        {children}
      </body>
    </html>
  );
}
