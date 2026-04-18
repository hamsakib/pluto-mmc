import { redirect } from 'next/navigation'

export async function POST() {
  redirect('/pricing?payment=failed')
}
