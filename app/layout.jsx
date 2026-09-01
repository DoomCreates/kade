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
              const titles = [
                "Kirby's vault",
                "Kirby's vault.",
                "Kirby's vault..",
                "Kirby's vault...",
                "Kirby's vault",
              ];

              let index = 0;
              let charIndex = 0;
              let current = titles[index];

              function typeCycle() {
                document.title = current.substring(0, charIndex);
                charIndex++;

                if (charIndex > current.length) {
                  index = (index + 1) % titles.length;
                  current = titles[index];
                  charIndex = 0;
                  setTimeout(typeCycle, 500);
                } else {
                  setTimeout(typeCycle, 150);
                }
              }

              typeCycle();
            `,
          }}
        />
      </head>

      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#000",
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
