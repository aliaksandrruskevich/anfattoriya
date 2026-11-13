import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware для редиректов:
 * - /rieltor-{slug} → /rieltor/{slug} (301)
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Старый формат ссылок на риэлтера: /rieltor-lositskiy-aleksandr
  if (pathname.startsWith('/rieltor-') && pathname !== '/rieltor') {
    const slug = pathname.replace('/rieltor-', '');
    if (slug) {
      const url = request.nextUrl.clone();
      url.pathname = `/rieltor/${slug}`;
      return NextResponse.redirect(url, 301);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Матчим только /rieltor-xxx (старый формат)
    '/rieltor-:path*',
  ],
};