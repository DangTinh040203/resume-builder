import { ImageResponse } from 'next/og';

// Apple touch icon (180×180) for iOS home-screen bookmarks — same brand mark
// as the favicon, scaled up with iOS-appropriate corner rounding.
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          // Brand --gradient-primary (violet-700 → violet-600)
          background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '40px',
        }}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='110'
          height='110'
          viewBox='0 0 24 24'
          fill='none'
          stroke='white'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' />
          <path d='M14 2v4a2 2 0 0 0 2 2h4' />
          <path d='M10 9H8' />
          <path d='M16 13H8' />
          <path d='M16 17H8' />
        </svg>
      </div>
    ),
    {
      ...size,
    },
  );
}
