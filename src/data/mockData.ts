import { Quote, Supplier, WhatsAppInstance, Category, City } from '@/types';

export const categories: Category[] = [
  { id: '1', name: 'Materiais de Construção' },
  { id: '2', name: 'Elétrica' },
  { id: '3', name: 'Hidráulica' },
  { id: '4', name: 'Ferramentas' },
  { id: '5', name: 'Acabamentos' },
  { id: '6', name: 'Tintas' },
];

export const cities: City[] = [
  { id: '1', name: 'São Paulo', state: 'SP' },
  { id: '2', name: 'Campinas', state: 'SP' },
  { id: '3', name: 'Santos', state: 'SP' },
  { id: '4', name: 'Ribeirão Preto', state: 'SP' },
  { id: '5', name: 'São José dos Campos', state: 'SP' },
];

export const suppliers: Supplier[] = [
  {
    id: '1',
    name: 'Casa dos Materiais',
    category: 'Materiais de Construção',
    city: 'São Paulo',
    address: 'Rua das Flores, 123',
    whatsapp: '11999998888',
    notes: 'Entrega rápida',
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '2',
    name: 'Elétrica Central',
    category: 'Elétrica',
    city: 'Campinas',
    address: 'Av. Principal, 456',
    whatsapp: '19988887777',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    name: 'HidroTech',
    category: 'Hidráulica',
    city: 'São Paulo',
    whatsapp: '11977776666',
    notes: 'Melhor preço da região',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '4',
    name: 'Ferragens SP',
    category: 'Ferramentas',
    city: 'Santos',
    address: 'Rua do Porto, 789',
    whatsapp: '13966665555',
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '5',
    name: 'Acabamentos Premium',
    category: 'Acabamentos',
    city: 'Ribeirão Preto',
    whatsapp: '16955554444',
    createdAt: new Date('2024-02-10'),
  },
  {
    id: '6',
    name: 'Tintas & Cores',
    category: 'Tintas',
    city: 'São Paulo',
    address: 'Rua das Tintas, 321',
    whatsapp: '11944443333',
    notes: 'Frete grátis acima de R$ 500',
    createdAt: new Date('2024-02-15'),
  },
  {
    id: '7',
    name: 'Materiais Express',
    category: 'Materiais de Construção',
    city: 'Campinas',
    whatsapp: '19933332222',
    createdAt: new Date('2024-02-20'),
  },
  {
    id: '8',
    name: 'Eletro Solutions',
    category: 'Elétrica',
    city: 'São José dos Campos',
    address: 'Av. Tecnológica, 1000',
    whatsapp: '12922221111',
    createdAt: new Date('2024-03-01'),
  },
];

export const quotes: Quote[] = [
  {
    id: '1',
    title: 'Cimento e Areia',
    category: 'Materiais de Construção',
    cities: ['São Paulo', 'Campinas'],
    message: 'Preciso de orçamento para:\n- 50 sacos de cimento CP-II\n- 10m³ de areia média\n\nPrazo de entrega: 5 dias úteis\nLocal: São Paulo - Zona Sul',
    generalNotes: 'Urgente - obra iniciando semana que vem',
    status: 'open',
    suppliers: [
      {
        supplierId: '1',
        supplier: suppliers[0],
        status: 'responded',
        value: 'R$ 2.350,00',
        notes: 'Entrega em 3 dias',
        respondedAt: new Date('2024-03-14'),
      },
      {
        supplierId: '7',
        supplier: suppliers[6],
        status: 'responded',
        value: 'R$ 2.580,00',
        notes: 'Frete incluso',
        respondedAt: new Date('2024-03-14'),
      },
    ],
    createdAt: new Date('2024-03-13'),
  },
  {
    id: '2',
    title: 'Fiação Elétrica',
    category: 'Elétrica',
    cities: ['São Paulo', 'Campinas', 'São José dos Campos'],
    message: 'Orçamento para:\n- 500m de fio 2.5mm\n- 300m de fio 4mm\n- 100m de fio 6mm\n\nMarca: Prysmian ou equivalente',
    status: 'open',
    suppliers: [
      {
        supplierId: '2',
        supplier: suppliers[1],
        status: 'waiting',
      },
      {
        supplierId: '8',
        supplier: suppliers[7],
        status: 'responded',
        value: 'R$ 1.890,00',
        respondedAt: new Date('2024-03-15'),
      },
    ],
    createdAt: new Date('2024-03-14'),
  },
  {
    id: '3',
    title: 'Tubos e Conexões',
    category: 'Hidráulica',
    cities: ['São Paulo'],
    message: 'Preciso de:\n- 20 tubos PVC 100mm\n- 50 joelhos 90°\n- 30 tês\n- 10 registros de esfera',
    status: 'open',
    suppliers: [
      {
        supplierId: '3',
        supplier: suppliers[2],
        status: 'waiting',
      },
    ],
    createdAt: new Date('2024-03-15'),
  },
  {
    id: '4',
    title: 'Tinta Látex',
    category: 'Tintas',
    cities: ['São Paulo'],
    message: 'Orçamento para 100 litros de tinta látex branco neve, marca Suvinil ou Coral.',
    status: 'closed',
    suppliers: [
      {
        supplierId: '6',
        supplier: suppliers[5],
        status: 'winner',
        value: 'R$ 1.200,00',
        notes: 'Melhor custo-benefício',
        respondedAt: new Date('2024-03-10'),
      },
    ],
    createdAt: new Date('2024-03-08'),
    closedAt: new Date('2024-03-12'),
    winnerId: '6',
  },
];

export const whatsappInstances: WhatsAppInstance[] = [
  {
    id: '1',
    name: 'Comercial Principal',
    status: 'connected',
    phoneNumber: '+55 11 99999-8888',
    connectedAt: new Date('2024-03-01'),
  },
  {
    id: '2',
    name: 'Suporte',
    status: 'disconnected',
  },
];
