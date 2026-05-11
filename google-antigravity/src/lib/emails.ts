import { resend } from './resend'

const FROM = 'DocWise <hello@docwise.ai>'

export async function sendWelcomeEmail(to: string, name: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Welcome to DocWise — let\'s set up your first chatbot',
    text: `Hi ${name},\n\nWelcome to DocWise! We're excited to have you on board.\n\nGet started by creating your first chatbot in just a few clicks:\n1. Give your bot a name\n2. Upload a document or add a URL\n3. Get your embed code and paste it on your site\n\nVisit: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/chatbots/new\n\nIf you have any questions, just reply to this email.\n\nThe DocWise Team`,
  })
}

export async function sendTrialEndingSoonEmail(to: string, name: string, daysLeft: number) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your DocWise trial ends in ${daysLeft} days`,
    text: `Hi ${name},\n\nYour 7-day free trial of DocWise ends in ${daysLeft} days. After that, your chatbot will stop responding to visitors.\n\nTo keep your chatbot running, add a payment method now:\n${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing\n\nThank you for trying DocWise!\nThe DocWise Team`,
  })
}

export async function sendTrialExpiredEmail(to: string, name: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your DocWise trial has ended',
    text: `Hi ${name},\n\nYour DocWise trial has ended. Your chatbot is now paused and will not respond to visitors.\n\nTo reactivate your chatbot, choose a plan:\n${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing\n\nWe'd love to have you continue using DocWise!\nThe DocWise Team`,
  })
}

export async function sendPaymentFailedEmail(to: string, name: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Action required: DocWise payment failed',
    text: `Hi ${name},\n\nYour recent payment for DocWise has failed. Please update your payment method to continue using the service.\n\nUpdate payment: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing\n\nThank you,\nThe DocWise Team`,
  })
}
