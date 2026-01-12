declare global {
  interface Window {
    g_config: {
      user: Partial<{
        username: string;
        type: 'admin' | 'user';
      }>,
      config: Partial<{
        login_method: 'third_party' | 'preset_account';
        upload_method: 'oss' | 'file';
      }>
    }
  }
}

declare module '*.module.less' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

import 'umi/typings';
