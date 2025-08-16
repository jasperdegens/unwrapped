import { Entity, Type } from '@graphprotocol/hypergraph';

export class WrappedCard extends Entity.Class<WrappedCard>('WrappedCard')({
  description: Type.String,
  name: Type.String,
  leadInText: Type.String,
  footnote: Type.String,
  updatedAt: Type.String,
  kind: Type.String,
  highlights: Type.String,
  media: Type.String,
  revealText: Type.String,
  order: Type.Number,
  createdAt: Type.String
}) {}

export class WrappedCardCollection extends Entity.Class<WrappedCardCollection>('WrappedCardCollection')({
  address: Type.String,
  cards: Type.Relation(WrappedCard),
  timestamp: Type.String
}) {}