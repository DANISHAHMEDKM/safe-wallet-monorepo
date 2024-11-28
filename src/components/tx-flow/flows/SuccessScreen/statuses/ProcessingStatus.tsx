// Extract status handling into separate components
import { Box, Typography } from '@mui/material'
import { SpeedUpMonitor } from '@/features/speedup/components/SpeedUpMonitor'
import { PendingStatus, type PendingTx } from '@/store/pendingTxsSlice'

type Props = {
  txId: string
  pendingTx: PendingTx
  isSubaccount: boolean
}
export const ProcessingStatus = ({ txId, pendingTx, isSubaccount }: Props) => (
  <Box
    sx={{
      paddingX: 3,
      mt: 3,
    }}
  >
    <Typography
      data-testid="transaction-status"
      variant="h6"
      sx={{
        marginTop: 2,
        fontWeight: 700,
      }}
    >
      {!isSubaccount ? 'Transaction is now processing' : 'Subaccount is being created'}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        mb: 3,
      }}
    >
      {!isSubaccount ? 'The transaction' : 'Your Subaccount'} was confirmed and is now being processed.
    </Typography>
    <Box>
      {pendingTx.status === PendingStatus.PROCESSING && (
        <SpeedUpMonitor txId={txId} pendingTx={pendingTx} modalTrigger="alertBox" />
      )}
    </Box>
  </Box>
)
