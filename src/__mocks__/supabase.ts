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

  // Add update to the object returned by from()
  const from = jest.fn().mockReturnValue({ insert, select, update });

  const client = { from }

  return { client, from, update, insert, select, selectAfterInsert, eqAfterSelect };
}
