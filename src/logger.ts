import createPino from 'pino'

export const createLogger = (module: string) =>
  createPino({
    base: {
      source: module,
    },
    ...(process.env.NODE_ENV === 'development'
      ? {
          transport: {
            target: 'pino-pretty',
            options: { colorize: true },
          },
        }
      : {}),
  })
