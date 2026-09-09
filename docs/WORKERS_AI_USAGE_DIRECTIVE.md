# Workers AI Usage Directive

Effective 2026-09-09.

The project should use Workers AI as the preferred native inference capacity for useful production and engineering workloads until the owner changes this requirement.

## Priority

1. Production AI chat and automotive reasoning.
2. Vehicle intelligence classification and interpretation under existing contracts.
3. Knowledge-grounded synthesis.
4. Structured validation assistance.
5. Cross-validation where it creates durable test or evidence value.

## Rules

- Use the native `env.AI` binding inside Workers whenever possible.
- Keep `@cf/zai-org/glm-4.7-flash` as the current primary model unless verified evidence requires a change.
- Preserve the fallback model for resilience.
- Do not add provider credentials for Workers AI.
- Do not manufacture traffic merely to consume Neurons.
- Avoid duplicate inference for the same logical task.
- Keep deterministic business rules and tests authoritative.
- Record model and validation behavior in checkpoints when changed.

The goal is maximum useful utilization of the available daily Neuron capacity, not artificial quota consumption.
