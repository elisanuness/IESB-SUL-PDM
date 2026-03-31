import DespesaSaida from '../components/DespesaSaida';

function DespesaRecente() {

    function filtrarUltimos7Dias (despesas) {
        const hoje = new Date();
        const seteDiasAtras = new Date();
        seteDiasAtras.setDate(hoje.getDate() - 7);

        return despesas.filter(despesa => {
            return despesa.data >= seteDiasAtras && despesa.data <= hoje;
        });
    }

    const DUMMY_DESPESAS = [
        {
            id: '1',
            descricao: 'Conta de luz',
            valor: 100.99,
            data: new Date(2025, 2, 11)
        },
        {
            id: '2',
            descricao: 'Conta de Agua',
            valor: 40.99,
            data: new Date(2025, 4, 10)
        }
    ];

    return (
        <DespesaSaida 
            despesas={filtrarUltimos7Dias(DUMMY_DESPESAS)} 
            periodo={'Últimos 7 dias'}
        />
    );
}

export default DespesaRecente;