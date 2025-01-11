
export default function GameDifficultyPicker(props: {
    current: number, onChange: (x: number) => void, disabled: boolean
}) {
    return <>
        <h2 className='text-2xl font-bold my-2'>Obtížnost hry</h2>
        <button onClick={() => props.onChange(0)} disabled={props.disabled}>
            <img src={`/Icon/zarivka_beginner_${props.current === 0 ? 'modre' : 'bile'}.svg`} alt="Začátečník"
                 width={64} height={64} className='m-2'></img>
        </button>
        <button onClick={() => props.onChange(1)} disabled={props.disabled}>
            <img src={`/Icon/zarivka_easy_${props.current === 1 ? 'modre' : 'bile'}.svg`} alt="Lehká" width={64}
                 height={64} className='m-2'></img>
        </button>
        <button onClick={() => props.onChange(2)} disabled={props.disabled}>
            <img src={`/Icon/zarivka_medium_${props.current === 2 ? 'modre' : 'bile'}.svg`} alt="Střední"
                 width={64} height={64} className='m-2'></img>
        </button>
        <button onClick={() => props.onChange(3)} disabled={props.disabled}>
            <img src={`/Icon/zarivka_hard_${props.current === 3 ? 'modre' : 'bile'}.svg`} alt="Těžká" width={64}
                 height={64} className='m-2'></img>
        </button>
        <button onClick={() => props.onChange(4)} disabled={props.disabled}>
            <img src={`/Icon/zarivka_extreme_${props.current === 4 ? 'modre' : 'bile'}.svg`} alt="Extrémní"
                 width={64} height={64} className='m-2'></img>
        </button>
    </>
}
