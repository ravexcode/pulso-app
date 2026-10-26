import { fireEvent, render, screen } from '@testing-library/react-native';

import { IntroCarousel } from '@/components/intro/intro-carousel';
import { INTRO_SLIDES } from '@/constants/intro-slides';

describe('IntroCarousel', () => {
  it('starts on the first slide', async () => {
    await render(<IntroCarousel onFinish={jest.fn()} />);

    expect(screen.getByText(INTRO_SLIDES[0].title)).toBeOnTheScreen();
    expect(screen.getByLabelText(`Paso 1 de ${INTRO_SLIDES.length}`)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Omitir' })).toBeOnTheScreen();
  });

  it('moves to the next slide and finishes on the last one', async () => {
    const onFinish = jest.fn();
    await render(<IntroCarousel onFinish={onFinish} />);

    for (let step = 2; step <= INTRO_SLIDES.length; step++) {
      await fireEvent.press(screen.getByRole('button', { name: 'Siguiente' }));
      expect(screen.getByLabelText(`Paso ${step} de ${INTRO_SLIDES.length}`)).toBeOnTheScreen();
    }
    expect(onFinish).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Omitir' })).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Comenzar' }));

    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('finishes when the user skips the intro', async () => {
    const onFinish = jest.fn();
    await render(<IntroCarousel onFinish={onFinish} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Omitir' }));

    expect(onFinish).toHaveBeenCalledTimes(1);
  });
});
