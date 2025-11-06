// https://allthingssmitty.com/2025/10/20/rethinking-async-loops-in-javascript/
// Order → for...of
// Speed → Promise.all()
// Safety → allSettled() / try-catch
// Balance → p-limit, etc.

// Use Promise.allSettled() or inline try/catch for safer batch execution.
const results = await Promise.allSettled(
  users.map(id => fetchUser(id))
);
// never use await in forEach(), forEach doesn’t wait for async callbacks. Your function may finish before the async work does, leading to silent bugs and missed errors.
results.forEach(result => {
  if (result.status === 'fulfilled') {
    console.log('✅ User:', result.value);
  } else {
    console.warn('❌ Error:', result.reason);
  }
});

// Promise.all() + map() for parallel logic. Handle errors inside the mapping function
const results = await Promise.all(
  users.map(async id => {
    try {
      return await fetchUser(id);
    } catch (err) {
      console.error(`Failed to fetch user ${id}`, err);
      return { id, name: 'Unknown User' }; // fallback value
    }
  })
);

// Modern solutions: for...of + await for sequential logic
for (const id of users) {
  const user = await fetchUser(id);
  console.log(user);
}

// not in an async function context:
(async () => {
  for (const id of users) {
    const user = await fetchUser(id);
    console.log(user);
  }
})();


// Throttled parallelism (controlled concurrency)
import pLimit from 'p-limit';

const limit = pLimit(2); // Run 2 fetches at a time
const limitedFetches = users.map(id => limit(() => fetchUser(id)));

const results = await Promise.all(limitedFetches);
