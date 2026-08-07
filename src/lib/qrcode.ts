import { customAlphabet } from "nanoid"
import QRCode from "qrcode"

const alphabet = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"
const gerarId = customAlphabet(alphabet, 12)

export function gerarTokenLote() {
  return gerarId()
}

export function montarLinkRastreio(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  return `${baseUrl}/rastreio/${token}`
}

export function gerarQrDataUrl(link: string) {
  return QRCode.toDataURL(link, { margin: 1, width: 320 })
}

export function gerarQrBuffer(link: string) {
  return QRCode.toBuffer(link, { margin: 1, width: 512 })
}
