## Frontend (Next.js)

**Philosophy**: Minimal, clean, functional. No future-proof complexity.

### Tech stack

- Next.js (App Router)
- TailwindCSS
- SWR for data fetching
- Stacks wallet connect (frontend only, pass walletAddress to backend)

### Pages

1. **Home** `/`

   - Show active pools.
   - Card: title, description, deadline, total stake.
   - Button: “Vote” → go to pool detail.

2. **Pool Detail** `/pool/[id]`

   - Show pool info.
   - Form: select yes/no and stake amount.
   - Button: submit vote & stake (calls backend).
   - If ended: show results and “Claim Reward” if eligible.

3. **Profile** `/profile`

   - Show user’s wallet address.
   - Show predictions made, staked amounts, claimed/unclaimed rewards.

### Components

- `PoolCard`
- `VoteForm`
- `StakeForm`
- `ClaimButton`

### Wallet Login

- Integrate **Stacks wallet connect** for login.
- On login, save walletAddress in app state and send it with backend requests.

---

## Flow summary

- Admin runs script → creates new pools.
- Users log in with Stacks wallet → vote/stake.
- Backend records all by walletAddress.
- After pool ends → user can claim rewards (mocked).
