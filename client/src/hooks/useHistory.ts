import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { IHistory } from '@aiuix/shared';

export const useHistory = () => {
  const [items, setItems] = useState<IHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [favOnly, setFavOnly] = useState(false);
  const LIMIT = 12;

  const fetch = useCallback(async (p = 1, fav = favOnly) => {
    setLoading(true);
    try {
      const res = await api.history.list(p, LIMIT, fav);
      if (res.data.success) {
        const d = (res.data as any).data;
        setItems(d.items);
        setTotal(d.total);
        setPage(p);
      }
    } finally {
      setLoading(false);
    }
  }, [favOnly]);

  useEffect(() => { fetch(1, favOnly); }, [favOnly]);

  const remove = async (id: string) => {
    await api.history.delete(id);
    setItems(prev => prev.filter(i => i._id !== id));
    setTotal(t => t - 1);
  };

  const toggleFav = async (id: string) => {
    await api.history.toggleFavorite(id);
    setItems(prev => prev.map(i => i._id === id ? { ...i, isFavorite: !i.isFavorite } : i));
  };

  return { items, total, page, loading, favOnly, setFavOnly, fetch, remove, toggleFav, LIMIT };
};
