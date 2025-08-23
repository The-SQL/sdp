// __mocks__/@clerk/nextjs/server.ts
export const clerkMiddleware = jest.fn(() => {
  return (req: any) => new Response('OK');
});

// Mock config if needed elsewhere
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};