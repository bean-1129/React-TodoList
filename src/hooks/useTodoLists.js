import useSWR from 'swr';

import { APIs, fetcher, putter } from '../utils.js';

export function useTodoLists() {
  const { data = [], mutate } = useSWR({ url: APIs.TodoLists }, fetcher);

  return {
    data,
    async newList(newListName, icon) {
      return await mutate(
        await putter({
          url: APIs.TodoLists,
          icon: icon || 'List',
          name: newListName,
        }),
        {
          populateCache: false,
          optimisticData: oldData => [
            ...oldData,
            { name: newListName, icon: icon || 'List', data: [] },
          ],
        }
      );
    },
    async updateList(listToUpdate, newListName) {
      await mutate(
        await putter({
          url: APIs.TodoListsUpdate,
          id: listToUpdate,
          name: newListName,
        }),
        {
          populateCache: false,
          optimisticData: oldData =>
            oldData.map(d => {
              if (d.id === listToUpdate) {
                return { ...d, name: newListName };
              }
              return d;
            }),
        }
      );
    },
    async deleteList(id) {
      // Perform the DELETE request here
      const response = await fetch(`${APIs.TodoLists}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        // If the request is successful, update the local data cache
        await mutate(oldData => oldData.filter(d => d.id !== id), false);
      } else {
        // Handle errors
        console.error('Failed to delete todo list:', response.statusText);
      }
    },
  };
}
