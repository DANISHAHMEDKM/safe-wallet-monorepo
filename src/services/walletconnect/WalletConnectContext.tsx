import { getSdkError } from '@walletconnect/utils'
import { type ReactNode, createContext, useEffect, useState } from 'react'

import useSafeInfo from '@/hooks/useSafeInfo'
import useSafeWalletProvider from '@/services/safe-wallet-provider/useSafeWalletProvider'
import WalletConnectWallet from './WalletConnectWallet'
import { asError } from '../exceptions/utils'
import { stripEip155Prefix } from './utils'
import { useWalletConnectSearchParamUri } from './useWalletConnectSearchParamUri'

const walletConnectSingleton = new WalletConnectWallet()

export const WalletConnectContext = createContext<{
  walletConnect: WalletConnectWallet | null
  error: Error | null
}>({
  walletConnect: null,
  error: null,
})

export const WalletConnectProvider = ({ children }: { children: ReactNode }) => {
  const {
    safe: { chainId },
    safeAddress,
  } = useSafeInfo()
  const [walletConnect, setWalletConnect] = useState<WalletConnectWallet | null>(null)
  const [wcUri, setWcUri] = useWalletConnectSearchParamUri()
  const [error, setError] = useState<Error | null>(null)
  const safeWalletProvider = useSafeWalletProvider()

  // Init WalletConnect
  useEffect(() => {
    walletConnectSingleton
      .init()
      .then(() => setWalletConnect(walletConnectSingleton))
      .catch(setError)
  }, [])

  // Connect to session present in URL
  useEffect(() => {
    if (!walletConnect || !wcUri) return

    walletConnect.connect(wcUri).catch(setError)

    return walletConnect.onSessionAdd(() => {
      setWcUri(null)
    })
  }, [setWcUri, walletConnect, wcUri])

  // Update chainId/safeAddress
  useEffect(() => {
    if (!walletConnect || !chainId || !safeAddress) return

    walletConnect.updateSessions(chainId, safeAddress).catch(setError)
  }, [walletConnect, chainId, safeAddress])

  // Subscribe to requests
  useEffect(() => {
    if (!walletConnect || !safeWalletProvider || !chainId) return

    return walletConnect.onRequest(async (event) => {
      const { topic } = event
      const session = walletConnect.getActiveSessions().find((s) => s.topic === topic)
      const requestChainId = stripEip155Prefix(event.params.chainId)

      if (!session || requestChainId !== chainId) {
        try {
          // Send error to WalletConnect
          await walletConnect.sendSessionResponse(topic, {
            id: event.id,
            jsonrpc: '2.0',
            error: getSdkError('UNSUPPORTED_CHAINS'),
          })
        } catch (e) {
          setError(asError(e))
        }

        return
      }

      try {
        // Get response from the Safe Wallet Provider
        const response = await safeWalletProvider.request(event.id, event.params.request, {
          name: session.peer.metadata.name,
          description: session.peer.metadata.description,
          url: session.peer.metadata.url,
          iconUrl: session.peer.metadata.icons[0],
        })

        // Send response to WalletConnect
        await walletConnect.sendSessionResponse(topic, response)
      } catch (e) {
        setError(asError(e))
      }
    })
  }, [walletConnect, chainId, safeWalletProvider])

  return <WalletConnectContext.Provider value={{ walletConnect, error }}>{children}</WalletConnectContext.Provider>
}
