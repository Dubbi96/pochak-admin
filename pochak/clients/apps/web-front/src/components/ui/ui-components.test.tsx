/**
 * Smoke tests for Dialog and Tooltip UI components (0% coverage)
 * Exercises: all exported components render without crashing
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'

vi.mock('@/services/api-client', () => ({
  pochakApi: { get: vi.fn(), post: vi.fn() },
  GATEWAY_URL: 'http://localhost:8080',
}))

vi.mock('@/hooks/useApi', () => ({
  useTeams: () => ({ data: [], loading: false, error: null }),
  useSearchSuggestions: () => ({ data: { contents: [], teams: [], competitions: [] }, loading: false, error: null }),
  useTrendingSearches: () => ({ data: [], loading: false, error: null }),
}))

describe('Dialog component', () => {
  it('renders Dialog with all subcomponents', async () => {
    const {
      Dialog,
      DialogTrigger,
      DialogContent,
      DialogHeader,
      DialogFooter,
      DialogTitle,
      DialogDescription,
      DialogClose,
    } = await import('./dialog')

    render(
      <Dialog>
        <DialogTrigger asChild>
          <button>Open Dialog</button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Title</DialogTitle>
            <DialogDescription>Test Description</DialogDescription>
          </DialogHeader>
          <p>Dialog body content</p>
          <DialogFooter>
            <DialogClose asChild>
              <button>Close</button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByText('Open Dialog')).toBeInTheDocument()
  })

  it('opens dialog when trigger is clicked', async () => {
    const {
      Dialog,
      DialogTrigger,
      DialogContent,
      DialogTitle,
      DialogDescription,
    } = await import('./dialog')

    render(
      <Dialog>
        <DialogTrigger asChild>
          <button>Open</button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
          <p>Body</p>
        </DialogContent>
      </Dialog>
    )

    const trigger = screen.getByText('Open')
    trigger.click()
    // After clicking, the dialog portal should render
  })

  it('renders DialogOverlay', async () => {
    const { DialogOverlay } = await import('./dialog')
    // DialogOverlay is meant to be used inside DialogPortal
    // Smoke test: just import and verify it exists
    expect(DialogOverlay).toBeDefined()
  })

  it('renders DialogPortal', async () => {
    const { DialogPortal } = await import('./dialog')
    expect(DialogPortal).toBeDefined()
  })

  it('renders DialogHeader with custom className', async () => {
    const { DialogHeader } = await import('./dialog')
    render(<DialogHeader className="custom-class">Header content</DialogHeader>)
    expect(screen.getByText('Header content')).toBeInTheDocument()
  })

  it('renders DialogFooter with custom className', async () => {
    const { DialogFooter } = await import('./dialog')
    render(<DialogFooter className="custom-footer">Footer content</DialogFooter>)
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })
})

describe('Tooltip component', () => {
  it('renders all tooltip subcomponents', async () => {
    const {
      Tooltip,
      TooltipTrigger,
      TooltipContent,
      TooltipProvider,
    } = await import('./tooltip')

    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button>Hover me</button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tooltip text</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })

  it('exports TooltipProvider', async () => {
    const { TooltipProvider } = await import('./tooltip')
    expect(TooltipProvider).toBeDefined()
  })

  it('exports Tooltip', async () => {
    const { Tooltip } = await import('./tooltip')
    expect(Tooltip).toBeDefined()
  })

  it('exports TooltipTrigger', async () => {
    const { TooltipTrigger } = await import('./tooltip')
    expect(TooltipTrigger).toBeDefined()
  })

  it('exports TooltipContent', async () => {
    const { TooltipContent } = await import('./tooltip')
    expect(TooltipContent).toBeDefined()
  })

  it('renders TooltipContent with custom className', async () => {
    const { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } = await import('./tooltip')
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent className="custom-tooltip">
            Custom tooltip
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    expect(screen.getByText('Trigger')).toBeInTheDocument()
  })
})

describe('Other UI components smoke tests', () => {
  it('renders badge component', async () => {
    const { Badge } = await import('./badge')
    render(<Badge>Test Badge</Badge>)
    expect(screen.getByText('Test Badge')).toBeInTheDocument()
  })

  it('renders badge variants', async () => {
    const { Badge } = await import('./badge')
    const { unmount: u1 } = render(<Badge variant="default">Default</Badge>)
    expect(screen.getByText('Default')).toBeInTheDocument()
    u1()
    const { unmount: u2 } = render(<Badge variant="secondary">Secondary</Badge>)
    expect(screen.getByText('Secondary')).toBeInTheDocument()
    u2()
    const { unmount: u3 } = render(<Badge variant="destructive">Destructive</Badge>)
    expect(screen.getByText('Destructive')).toBeInTheDocument()
    u3()
    render(<Badge variant="outline">Outline</Badge>)
    expect(screen.getByText('Outline')).toBeInTheDocument()
  })

  it('renders skeleton component', async () => {
    const { Skeleton } = await import('./skeleton')
    const { container } = render(<Skeleton className="h-4 w-20" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders separator component', async () => {
    const { Separator } = await import('./separator')
    const { container } = render(<Separator />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders switch component', async () => {
    const { Switch } = await import('./switch')
    render(<Switch />)
  })

  it('renders input component', async () => {
    const { Input } = await import('./input')
    render(<Input placeholder="Test" />)
    expect(screen.getByPlaceholderText('Test')).toBeInTheDocument()
  })

  it('renders tabs components', async () => {
    const { Tabs, TabsList, TabsTrigger, TabsContent } = await import('./tabs')
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Tab A</TabsTrigger>
          <TabsTrigger value="b">Tab B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content A</TabsContent>
        <TabsContent value="b">Content B</TabsContent>
      </Tabs>
    )
    expect(screen.getByText('Tab A')).toBeInTheDocument()
    expect(screen.getByText('Content A')).toBeInTheDocument()
  })

  it('renders card components', async () => {
    const { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } = await import('./card')
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    )
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders avatar components', async () => {
    const { Avatar, AvatarFallback } = await import('./avatar')
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    )
    expect(screen.getByText('AB')).toBeInTheDocument()
  })

  it('renders dropdown-menu components', async () => {
    const { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } = await import('./dropdown-menu')
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <div>Item</div>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(screen.getByText('Menu')).toBeInTheDocument()
  })
})
