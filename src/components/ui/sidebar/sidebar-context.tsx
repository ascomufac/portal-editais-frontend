
import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"

/**
 * Nome do cookie para armazenar o estado da barra lateral
 * @type {string}
 * @description Identificador usado para salvar o estado da barra lateral em um cookie
 */
const SIDEBAR_COOKIE_NAME = "sidebar:state"

/**
 * Tempo máximo de validade do cookie em segundos (7 dias)
 * @type {number}
 * @description Define quanto tempo o cookie de estado da barra lateral permanece válido
 */
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

/**
 * Atalho de teclado para alternar a barra lateral
 * @type {string}
 * @description Tecla que, combinada com Ctrl ou Cmd, alterna a visibilidade da barra lateral
 */
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

/**
 * Interface para o contexto da barra lateral
 * @interface SidebarContext
 * @property {string} state - Estado da barra lateral ("expanded" ou "collapsed")
 * @property {boolean} open - Se a barra lateral está aberta
 * @property {function} setOpen - Função para definir se a barra lateral está aberta
 * @property {boolean} openMobile - Se a barra lateral está aberta em dispositivos móveis
 * @property {function} setOpenMobile - Função para definir se a barra lateral está aberta em dispositivos móveis
 * @property {boolean} isMobile - Se o dispositivo é móvel
 * @property {function} toggleSidebar - Função para alternar o estado da barra lateral
 */
type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

/**
 * Contexto para a barra lateral
 * @description Contexto React que mantém o estado e as funções da barra lateral
 */
const SidebarContext = React.createContext<SidebarContext | null>(null)

/**
 * Hook para usar o contexto da barra lateral
 * @returns {SidebarContext} Contexto da barra lateral
 * @throws {Error} Erro se usado fora de um SidebarProvider
 * @description Fornece acesso ao estado e às funcionalidades da barra lateral
 */
export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar deve ser usado dentro de um SidebarProvider.")
  }

  return context
}

/**
 * Provedor de contexto para a barra lateral
 * @description Componente que gerencia o estado da barra lateral e fornece métodos para manipulá-la
 */
export const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)

    // Este é o estado interno da barra lateral.
    // Usamos openProp e setOpenProp para controle de fora do componente.
    const [_open, _setOpen] = React.useState(defaultOpen)
    const open = openProp ?? _open
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }

        // Isso define o cookie para manter o estado da barra lateral.
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
      },
      [setOpenProp, open]
    )

    /**
     * Função auxiliar para alternar a barra lateral
     * @description Alterna entre estado aberto/fechado, considerando se é dispositivo móvel
     */
    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((open) => !open)
        : setOpen((open) => !open)
    }, [isMobile, setOpen, setOpenMobile])

    // Adiciona um atalho de teclado para alternar a barra lateral.
    React.useEffect(() => {
      /**
       * Manipulador de evento de tecla pressionada
       * @param {KeyboardEvent} event - Evento de teclado
       * @description Verifica se a combinação de teclas para alternar a barra lateral foi pressionada
       */
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    // Adicionamos um estado para que possamos fazer data-state="expanded" ou "collapsed".
    // Isso facilita o estilo da barra lateral com classes Tailwind.
    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        {children}
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"
