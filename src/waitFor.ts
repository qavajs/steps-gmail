export async function waitFor(fn: Function, { interval = 500, timeout = 5000 }): Promise<any> {
  return new Promise((resolve, reject) => {
    let timer = 0;
    const waitInterval = setInterval(async () => {
      timer += interval;
      if (timer > timeout) {
        clearInterval(waitInterval);
        reject(new Error(`timeout ${timeout} ms`));
      }
      try {
        const result = await fn();
        if (result) {
          resolve(result);
        }
      } catch (err) {
        clearInterval(waitInterval);
        reject(new Error(`function throw err: ${err}`));
      }
    }, interval);
  });
}
