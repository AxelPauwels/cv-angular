export const typeDefs = /* GraphQL */ `
  enum SkillCategory {
    FRONTEND
    BACKEND
    TOOLING
  }

  type Profile {
    name: String!
    headline: String!
    location: String!
    summary: String!
  }

  type Skill {
    id: ID!
    name: String!
    category: SkillCategory!
  }

  type Experience {
    id: ID!
    company: String!
    role: String!
    from: String!
    to: String
    description: String!
    skills: [Skill!]!
  }

  type Person {
    id: ID!
    name: String!
    age: Int!
  }

  type Query {
    people: [Person!]!
    person(id: ID!): Person
    profile: Profile!
    experiences(limit: Int): [Experience!]!
    experience(id: ID!): Experience
    skills(category: SkillCategory): [Skill!]!
  }
`;
