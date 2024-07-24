import { type SyntheticEvent, type ReactElement, memo } from 'react'
import { isCustomTxInfo } from '@/utils/transaction-guards'
import { Accordion, AccordionDetails, AccordionSummary, Box, Skeleton, Stack } from '@mui/material'
import { OperationType, type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import type { DecodedDataResponse } from '@safe-global/safe-gateway-typescript-sdk'
import { getTransactionDetails, type TransactionDetails, Operation } from '@safe-global/safe-gateway-typescript-sdk'
import useChainId from '@/hooks/useChainId'
import useAsync from '@/hooks/useAsync'
import ErrorMessage from '../ErrorMessage'
import Summary, { PartialSummary } from '@/components/transactions/TxDetails/Summary'
import { trackEvent, MODALS_EVENTS } from '@/services/analytics'
import Multisend from '@/components/transactions/TxDetails/TxData/DecodedData/Multisend'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DecodedData from '@/components/transactions/TxDetails/TxData/DecodedData'
import accordionCss from '@/styles/accordion.module.css'
import HelpToolTip from './HelpTooltip'

type DecodedTxProps = {
  tx?: SafeTransaction
  txId?: string
  showMultisend?: boolean
  decodedData?: DecodedDataResponse
  decodedDataError?: Error
  decodedDataLoading?: boolean
  showMethodCall?: boolean
}

const DecodedTx = ({
  tx,
  txId,
  decodedData,
  decodedDataError,
  decodedDataLoading,
  showMultisend = true,
  showMethodCall = false,
}: DecodedTxProps): ReactElement => {
  const chainId = useChainId()
  const isMultisend = !!decodedData?.parameters?.[0]?.valueDecoded
  const isMethodCallInAdvanced = !showMethodCall || isMultisend

  const [txDetails, txDetailsError, txDetailsLoading] = useAsync<TransactionDetails>(() => {
    if (!txId) return
    return getTransactionDetails(chainId, txId)
  }, [chainId, txId])

  const onChangeExpand = (_: SyntheticEvent, expanded: boolean) => {
    trackEvent({ ...MODALS_EVENTS.TX_DETAILS, label: expanded ? 'Open' : 'Close' })
  }

  const addressInfoIndex = txDetails?.txData?.addressInfoIndex

  const txData = {
    dataDecoded: decodedData,
    to: { value: tx?.data.to || '' },
    value: tx?.data.value,
    operation: tx?.data.operation === OperationType.DelegateCall ? Operation.DELEGATE : Operation.CALL,
    trustedDelegateCallTarget: txDetails?.txData?.trustedDelegateCallTarget ?? true,
    addressInfoIndex,
  }

  const toInfo =
    (txDetails && isCustomTxInfo(txDetails.txInfo) ? txDetails.txInfo.to : undefined) ||
    (tx
      ? {
          value: tx.data.to,
        }
      : undefined)

  const decodedDataBlock = decodedDataLoading ? (
    <Skeleton />
  ) : decodedDataError ? (
    <ErrorMessage error={decodedDataError}>Failed decoding transaction data</ErrorMessage>
  ) : (
    <DecodedData txData={txData} toInfo={toInfo} />
  )

  return (
    <Stack spacing={2}>
      {!isMethodCallInAdvanced && decodedDataBlock}

      {isMultisend && showMultisend && (
        <Box>
          <Multisend txData={txDetails?.txData || txData} compact />
        </Box>
      )}

      <Box>
        <Accordion elevation={0} onChange={onChangeExpand} sx={!tx ? { pointerEvents: 'none' } : undefined}>
          <AccordionSummary
            data-testid="decoded-tx-summary"
            expandIcon={<ExpandMoreIcon />}
            className={accordionCss.accordion}
          >
            <Box display="flex" alignItems="center">
              Advanced details
              <HelpToolTip />
            </Box>
          </AccordionSummary>

          <AccordionDetails data-testid="decoded-tx-details">
            {isMethodCallInAdvanced && (
              <>
                {decodedDataBlock}

                {/* Divider */}
                <Box
                  borderBottom="1px solid var(--color-border-light)"
                  width="calc(100% + 32px)"
                  my={2}
                  sx={{ ml: '-16px !important' }}
                />
              </>
            )}

            {txDetails ? <Summary txDetails={txDetails} defaultExpanded /> : tx && <PartialSummary safeTx={tx} />}

            {txDetailsLoading && <Skeleton />}

            {txDetailsError && (
              <ErrorMessage error={txDetailsError}>Failed loading all transaction details</ErrorMessage>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>
    </Stack>
  )
}

export default memo(DecodedTx)
