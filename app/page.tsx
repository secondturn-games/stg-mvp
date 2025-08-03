import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect to game listing page for development
  redirect('/list-game')
}
