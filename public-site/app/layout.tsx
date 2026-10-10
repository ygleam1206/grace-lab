export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Grace Lab</title>
        <meta name="description" content="Grace 的个人知识库与学习笔记" />
      </head>
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              Grace Lab
            </a>
            <nav className="flex gap-6 text-sm">
              <a href="/" className="text-gray-600 hover:text-gray-900">首页</a>
              <a href="/notes" className="text-gray-600 hover:text-gray-900">笔记</a>
              <a href="/categories" className="text-gray-600 hover:text-gray-900">分类</a>
            </nav>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
            <p>© 2026 Grace Lab. Powered by Next.js & GitHub Pages.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
