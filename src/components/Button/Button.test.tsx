import { render, userEvent } from '@/src/tests/test-utils'
import { SafeButton } from './Button'

describe('Button', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the default markup', () => {
    const container = render(<SafeButton onPress={jest.fn()} text="sign" />)

    expect(container).toMatchSnapshot()
  })

  it('should be able to click', async () => {
    const user = userEvent.setup()

    const mockedFn = jest.fn()
    const container = render(<SafeButton onPress={mockedFn} text="sign" />)

    await user.press(container.getByText('sign'))

    expect(mockedFn).toHaveBeenCalled()
  })
})
