export const metadata = {
  title: "Kirby's Vault",
  description: "doom panel access",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const title = "Kirby's Vault";
              let i = 0;
              function typeTitle() {
                document.title = title.substring(0, i);
                i++;
                if (i <= title.length) {
                  setTimeout(typeTitle, 150);
                }
              }
              typeTitle();
            `,
          }}
        />
      </head>

      <body
        style={{
          margin: 0,
          padding: 0,
          background: "radial-gradient(circle at top, #0a0a0a, #000)",
          color: "#fff",
          fontFamily: "Inter, system-ui, sans-serif",
          overflowX: "hidden",
        }}
      >
        {children}
      </body>
    </html>
  );
}
