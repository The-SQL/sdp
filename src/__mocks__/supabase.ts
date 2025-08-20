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

  const from = jest.fn().mockReturnValue({ insert, select });

  const client = { from } as unknown;

  return { client, from, insert, select, selectAfterInsert, eqAfterSelect };
}
