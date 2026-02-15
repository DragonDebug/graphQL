export const GET_USER_LOGIN_INFO = `{
  user {
    id
    login
    attrs
  }
}`;

export const GET_XP_TRANSACTIONS = `
  query ($userId: Int!) {
    transaction(
      where: { userId: { _eq: $userId }, type: { _eq: "xp" } }
      order_by: { createdAt: asc }
    ) {
      amount
      createdAt
      path
      type
      object {
        name
        type
        attrs
      }
    }
  }
`;

export const GET_AUDIT_RATIO = `
  query ($userId: Int!) {
    user(where: { id: { _eq: $userId } }) {
      auditRatio
      totalUp
      totalDown
    }
  }
`;
