# RPTC Workflow Instructions

This project uses the **RPTC (Research → Plan → TDD → Commit)** workflow methodology for structured, test-driven development.

## Workflow Commands

### Research Phase
```bash
/rptc:research "<research topic>"
```
- Conduct comprehensive research with Master Research Agent
- Consults 20+ diverse sources with cross-verification
- Generates structured reports with citations
- Use for: technical research, best practices, implementation patterns

### Planning Phase
```bash
/rptc:plan "<feature description>"
```
- Create comprehensive TDD-ready implementation plans
- Designs detailed test strategies before implementation
- Maps file changes, dependencies, and risks
- Defines measurable acceptance criteria

### TDD Implementation Phase
```bash
/rptc:tdd "@plan-name/"
```
- Execute test-driven implementation
- Follows RED → GREEN → REFACTOR → SYNC cycle
- Includes quality gates (efficiency & security reviews with PM approval)
- Options: step-by-step, batch by track, or automatic execution

### Commit Phase
```bash
/rptc:commit
```
- Comprehensive verification before shipping
- Intelligent documentation synchronization
- Quality gate verification
- Multi-repository support

## Helper Commands

### Simplify Existing Code
```bash
/rptc:helper-simplify "<code location>"
```
- Simplify existing code complexity outside TDD workflow
- Applies KISS and YAGNI principles
- Targets: cyclomatic complexity <10, cognitive complexity <15

### Cleanup Completed Plans
```bash
/rptc:helper-cleanup
```
- Review and cleanup completed plans from .rptc/plans/
- Archives to .rptc/complete/

## Admin Commands

### Initialize Workspace
```bash
/rptc:admin-init
```
- Initialize RPTC workflow workspace in current project
- Creates directory structure and configuration files

### Show Configuration
```bash
/rptc:admin-config
```
- Display RPTC workflow configuration and SOP resolution

### Verify SOPs
```bash
/rptc:admin-sop-check
```
- Verify SOP resolution and show which file will be used

### Workspace Upgrade
```bash
/rptc:admin-upgrade
```
- Comprehensive workspace verification, repair, and upgrade

## Configuration

Configuration is stored in `.claude/settings.json`:

- **defaultThinkingMode**: "think" (options: think, think-hard, ultrathink)
- **artifactLocation**: ".rptc" (location for active work)
- **docsLocation**: "docs" (permanent documentation location)
- **testCoverageTarget**: 85 (target test coverage percentage)
- **customSopPath**: ".rptc/sop" (project-specific SOPs)
- **qualityGatesEnabled**: false (enable efficiency & security reviews)

## Directory Structure

```
.rptc/
├── research/        # Active research findings
├── plans/          # Active implementation plans
├── complete/       # Archived completed work
└── sop/           # Project-specific Standard Operating Procedures

docs/
├── research/       # Permanent research documentation
├── plans/         # Permanent plan documentation
├── architecture/  # Architecture documentation
├── patterns/      # Pattern documentation
└── api/          # API documentation
```

## Thinking Modes

- **think**: ~4K tokens, balanced analysis
- **think-hard**: ~10K tokens, deep analysis
- **ultrathink**: ~32K tokens, maximum depth and rigor

Override thinking mode by adding it to any command:
```bash
/rptc:research "topic" ultrathink
```

## Quality Gates

When `qualityGatesEnabled: true`:
- **Efficiency Review**: After tests pass, reviews code for optimization opportunities
- **Security Review**: After efficiency review, performs comprehensive security audit
- Both require PM approval before proceeding

## Best Practices

1. **Start with Research**: Use `/rptc:research` for unfamiliar topics or APIs
2. **Plan Before Coding**: Use `/rptc:plan` to create comprehensive implementation plans
3. **TDD Implementation**: Always implement with tests first (RED → GREEN → REFACTOR)
4. **Quality Gates**: Enable for production code requiring optimization and security review
5. **Document as You Go**: SYNC phase keeps documentation synchronized with code
6. **Archive Completed Work**: Use `/rptc:helper-cleanup` to maintain clean workspace

## Support

- Plugin Version: 2.1.1
- Documentation: See plugin skills for detailed workflows
- Issues: Report via project issue tracker
