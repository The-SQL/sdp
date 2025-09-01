// Central Supabase mock factory for reusable tests
export type QueryResult = { data: unknown; error: unknown };

export function makeSupabaseMock(options: {
  insertSelect?: QueryResult; // for insert().select()
  selectEq?: QueryResult;     // for select().eq()
}) {
  const selectAfterInsert = jest
    .fn()
    .mockResolvedValue(options.insertSelect ?? { data: null, error: null });
  const insert = jest.fn().mockReturnValue({ select: selectAfterInsert });

  const eqAfterSelect = jest
    .fn()
    .mockResolvedValue(options.selectEq ?? { data: null, error: null });
  const select = jest.fn().mockReturnValue({ eq: eqAfterSelect });

  // Mock for update chain: .from().update().eq().select()
  const update = jest.fn().mockImplementation(() => ({
    eq: () => ({
      select: selectAfterInsert,
    }),
  }));

  // Add support for .single() and .maybeSingle() after select/eq
  const single = jest.fn().mockResolvedValue(options.selectEq ?? { data: null, error: null });
  const maybeSingle = jest.fn().mockResolvedValue(options.selectEq ?? { data: null, error: null });

  // Add support for .order() and .limit() chain
  const order = jest.fn().mockReturnThis();
  const limit = jest.fn().mockReturnThis();

  // Add support for .delete()
  const deleteFn = jest.fn().mockResolvedValue({ error: null });

  // Add support for .storage (for uploadImageToSupabase)
  const upload = jest.fn().mockResolvedValue({ error: null });
  const getPublicUrl = jest.fn().mockReturnValue({ data: { publicUrl: 'mock-url' } });
  const fromStorage = jest.fn().mockReturnValue({ upload, getPublicUrl });
  const storage = { from: fromStorage };

  // Patch .from() to support all chains
  const from = jest.fn().mockReturnValue({
    insert,
    select,
    update,
    eq: eqAfterSelect,
    order,
    limit,
    delete: deleteFn,
    storage,
  });

  const client = { from, storage };

  // Patch select/eq to support .single() and .maybeSingle()
  select.mockReturnValue({ eq: eqAfterSelect, single, maybeSingle, order, limit });
  eqAfterSelect.mockReturnValue({ single, maybeSingle });

  return { client, from, update, insert, select, selectAfterInsert, eqAfterSelect, single, maybeSingle, order, limit, deleteFn, storage };
}
