import { PAGINATION_QUERY } from '../components/Pagination';

export default function paginationField() {
  return {
    keyArgs: false,
    read(existing = [], { args, cache }) {
      const { skip, first } = args;
      // read the number of items on the page from the cache
      const data = cache.readQuery({ query: PAGINATION_QUERY });
      const count = data?._allProductsMeta?.count;
      const page = skip / first + 1;
      const pages = Math.ceil(count / first);

      //   check if we have existing items
      const items = existing.slice(skip, skip + first).filter(x => x);
      //   if
      //      there are items
      //      and there aren't enough items to satisfy how many were requested
      //      and we are on the lst page
      //      then just send it
      if (items.length && items.length !== first && page === pages) {
        return items;
      }
      if (items.length !== first) {
        //   we don't have any items we must go to the network to fetch them
        return false;
      }

      //   if ther are items return them from the cache, and we don't need to go to the network
      if (items.length) {
        console.log(`There are ${items.length} items in the cache! Gonna send them to Apollo`);
        return items;
      }

      return false; //fallback to network
      // first thing it does is ask the read function for those items.

      // we can do one of two things

      // first thing is return items that are already in the cache

      // the other thing we can do is return false from here,  (network request)
    },
    merge(existing, incoming, { args }) {
      const { skip, first } = args;
      // this runs when the Apollo client comes back from the network with our products
      console.log(`Merging items from the network ${incoming.length}`);
      console.log(incoming);
      const merged = existing ? existing.slice(0) : [];
      for (let i = skip; i < skip + incoming.length; ++i) {
        merged[i] = incoming[i - skip];
      }
      console.log(merged);
      //   finally we return the merged items from the cache
      return merged;
    }
  };
}
