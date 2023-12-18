import { renderHook, act } from '@testing-library/react-hooks';
import { useModal } from '../../src/hooks/useModal';

describe('Initializing useModal hook', () => {
    test('useModal initializes with default values', () => {
        const { result } = renderHook(() => useModal());

        expect(result.current.showModal).toBeUndefined();
        expect(result.current.modalContent).toBeUndefined();
        expect(result.current.modalTitle).toBeUndefined();
    });

    test('handleModal sets showModal, modalContent, and modalTitle', async () => {
        const { result } = renderHook(() => useModal());

        act(() => {
            result.current.handleModal('Test Title', 'Test Content');
        });

        expect(result.current.showModal).toBeDefined();
        expect(result.current.modalContent).toBe('Test Content');
        expect(result.current.modalTitle).toBe('Test Title');
    });

    test('closeModal sets showModal to false', async () => {
        const { result } = renderHook(() => useModal());

        act(() => {
            result.current.handleModal('Test Title', 'Test Content');
            result.current.closeModal();
        });

        expect(result.current.showModal).toBeNull();
    });

    test('check when content and title are null', async () => {
        const { result } = renderHook(() => useModal());

        act(() => {
            result.current.handleModal(null, null);
        });

        expect(result.current.showModal).toBeTruthy();
        expect(result.current.modalContent).toBeUndefined();
        expect(result.current.modalTitle).toBeUndefined();
    });
});
