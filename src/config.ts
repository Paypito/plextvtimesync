export const config = {
  tvtime: {
    token: {
      symfony: process.env.TVTIME_SYMFONY || '',
      tvstRemember:
        process.env.TVTIME_TVST_REMEMBER || ''
    }
  },
  plex: {
    baseUrl: process.env.PLEX_BASE_URL || '',
    token: process.env.PLEX_TOKEN || ''
  },
  timer: Number.isInteger(parseInt(process.env.JOB_TIMER || ''))
    ? parseInt(process.env.JOB_TIMER || '')
    : 20
};
