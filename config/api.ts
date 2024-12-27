export const API_CONFIG = {
    BASE_URL: 'http://localhost:3001',
    ENDPOINTS: {
      TEST_USERS: {
        LOGIN: '/users/login',
        REGISTER: '/users/register',
      },
    },
  } as const;