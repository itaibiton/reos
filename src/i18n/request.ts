import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: 'Asia/Jerusalem',
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        },
        medium: {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        },
        monthDay: {
          day: 'numeric',
          month: 'short'
        },
        full: {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        },
        dateTime: {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        },
        time: {
          hour: 'numeric',
          minute: '2-digit'
        }
      },
      number: {
        integer: {
          maximumFractionDigits: 0
        },
        decimal: {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        },
        compact: {
          notation: 'compact'
        },
        percent: {
          style: 'percent',
          minimumFractionDigits: 1
        },
        currencyUSD: {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0
        },
        currencyILS: {
          style: 'currency',
          currency: 'ILS',
          maximumFractionDigits: 0
        }
      }
    }
  }
})
