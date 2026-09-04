const MAX_INSTRUCTION_LENGTH = 12000;

const REPOSITORY = 'phanthuanxtra-v9/phanthuanxtra-v9';
const DEFAULT_BRANCH = 'main';
const CODEX_WORKFLOW = 'codex-agent.yml';

const MODES = new Set([
  'audit',
  'test',
  'propose-fix'
]);

/**
 * Developer Gateway
 *
 * Security model:
 * - /health is public.
 * - All other endpoints require Bearer authentication.
 * - Repository is hard-pinned.
 * - Branch is hard-pinned to main.
 * - Codex execution is delegated to GitHub Actions.
 * - Production deploy/rollback remain disabled.
 * - Secrets are never returned in API responses.
 */

function json(data, status = 200, headers = {}) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        ...headers
      }
    }
  );
}

function cors(request, env) {
  const allowed = new Set(
    (env.GATEWAY_ALLOWED_ORIGINS || '')
      .split(',')
      .map(value => value.trim())
      .filter(Boolean)
  );

  const origin = request.headers.get('Origin');

  if (!origin || !allowed.has(origin)) {
    return {};
  }

  return {
    'access-control-allow-origin': origin,
    'access-control-allow-headers':
      'authorization,content-type,x-request-id',
    'access-control-allow-methods':
      'GET,POST,OPTIONS',
    'vary': 'Origin'
  };
}

function constantTimeEqual(a, b) {
  const encoder = new TextEncoder();

  const left = encoder.encode(a);
  const right = encoder.encode(b);

  let difference = left.length ^ right.length;

  const length = Math.max(
    left.length,
    right.length
  );

  for (let index = 0; index < length; index += 1) {
    difference |=
      (left[index] || 0) ^
      (right[index] || 0);
  }

  return difference === 0;
}

function unauthorized(headers) {
  return json(
    {
      ok: false,
      error: 'unauthorized'
    },
    401,
    headers
  );
}

function authenticate(request, env) {
  const expectedToken = env.GATEWAY_READ_TOKEN;

  if (!expectedToken) {
    return false;
  }

  const authorization =
    request.headers.get('Authorization') || '';

  return constantTimeEqual(
    authorization,
    `Bearer ${expectedToken}`
  );
}

function validRepository(value) {
  return (
    value === undefined ||
    value === REPOSITORY
  );
}

function validBranch(value) {
  return (
    value === undefined ||
    value === DEFAULT_BRANCH
  );
}

function productionMutationsEnabled(env) {
  return env.PRODUCTION_MUTATIONS_ENABLED === 'true';
}

/**
 * Dispatch Codex through GitHub Actions.
 */
async function dispatchCodexTask(env, task) {
  const token =
    env.GITHUB_ACTIONS_DISPATCH_TOKEN;

  if (!token) {
    return {
      ok: false,
      error: 'github_dispatch_not_configured'
    };
  }

  const githubUrl =
    `https://api.github.com/repos/${REPOSITORY}` +
    `/actions/workflows/${CODEX_WORKFLOW}/dispatches`;

  const response = await fetch(
    githubUrl,
    {
      method: 'POST',

      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent':
          'phanthuanxtra-developer-gateway',
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        ref: DEFAULT_BRANCH,

        inputs: {
          instruction: task.instruction,
          mode: task.mode,
          task_id: task.taskId
        }
      })
    }
  );

  /**
   * GitHub workflow_dispatch returns HTTP 204
   * when the dispatch request is accepted.
   */
  if (response.status === 204) {
    return {
      ok: true
    };
  }

  const detail =
    await response
      .text()
      .catch(() => '');

  return {
    ok: false,
    error: 'github_dispatch_failed',
    status: response.status,
    detail: detail.slice(0, 500)
  };
}

export default {
  async fetch(request, env) {
    const headers = cors(request, env);
    const origin = request.headers.get('Origin');

    /**
     * ---------------------------------------------------------
     * CORS PREFLIGHT
     * ---------------------------------------------------------
     */
    if (request.method === 'OPTIONS') {
      if (
        origin &&
        !headers['access-control-allow-origin']
      ) {
        return json(
          {
            ok: false,
            error: 'cors_origin_denied'
          },
          403
        );
      }

      return new Response(
        null,
        {
          status: 204,
          headers
        }
      );
    }

    const url = new URL(request.url);

    /**
     * ---------------------------------------------------------
     * PUBLIC HEALTH CHECK
     * ---------------------------------------------------------
     */
    if (
      url.pathname === '/health' &&
      request.method === 'GET'
    ) {
      return json(
        {
          ok: true,
          service: 'developer-gateway',
          mode:
            env.GATEWAY_MODE ||
            'readonly',
          production_mutations:
            productionMutationsEnabled(env)
        },
        200,
        headers
      );
    }

    /**
     * ---------------------------------------------------------
     * AUTHENTICATION
     * ---------------------------------------------------------
     */
    if (!authenticate(request, env)) {
      return unauthorized(headers);
    }

    /**
     * ---------------------------------------------------------
     * PROJECT STATUS
     * ---------------------------------------------------------
     */
    if (
      request.method === 'GET' &&
      url.pathname === '/v1/project/status'
    ) {
      return json(
        {
          ok: true,
          repository: REPOSITORY,
          branch: DEFAULT_BRANCH,
          production_mutations:
            productionMutationsEnabled(env)
        },
        200,
        headers
      );
    }

    /**
     * ---------------------------------------------------------
     * GITHUB STATUS
     * ---------------------------------------------------------
     */
    if (
      request.method === 'GET' &&
      url.pathname === '/v1/github/status'
    ) {
      return json(
        {
          ok: true,
          provider: 'github',
          repository: REPOSITORY,
          branch: DEFAULT_BRANCH,

          access:
            env.GITHUB_ACTIONS_DISPATCH_TOKEN
              ? 'configured'
              : 'pending-github-dispatch-credential',

          workflow: CODEX_WORKFLOW
        },
        200,
        headers
      );
    }

    /**
     * ---------------------------------------------------------
     * DEVBOX STATUS
     * ---------------------------------------------------------
     */
    if (
      request.method === 'GET' &&
      url.pathname === '/v1/devbox/status'
    ) {
      return json(
        {
          ok: true,
          provider:
            'github-actions-codex-runner',
          status:
            'not-required-for-phase-2a'
        },
        200,
        headers
      );
    }

    /**
     * ---------------------------------------------------------
     * CLOUDFLARE OBSERVABILITY
     * ---------------------------------------------------------
     */
    if (
      request.method === 'GET' &&
      url.pathname ===
        '/v1/cloudflare/observability'
    ) {
      return json(
        {
          ok: true,
          provider: 'cloudflare',
          status:
            'pending-cloudflare-credentials',
          secrets_exposed: false
        },
        200,
        headers
      );
    }

    /**
     * ---------------------------------------------------------
     * CREATE CODEX TASK
     * ---------------------------------------------------------
     */
    if (
      request.method === 'POST' &&
      url.pathname === '/v1/codex/tasks'
    ) {
      /**
       * Require JSON.
       */
      const contentType =
        request.headers
          .get('content-type')
          ?.toLowerCase() || '';

      if (!contentType.includes('application/json')) {
        return json(
          {
            ok: false,
            error: 'content_type_required'
          },
          415,
          headers
        );
      }

      /**
       * Parse JSON safely.
       */
      const body =
        await request
          .json()
          .catch(() => null);

      if (
        !body ||
        typeof body !== 'object' ||
        Array.isArray(body)
      ) {
        return json(
          {
            ok: false,
            error: 'invalid_json'
          },
          400,
          headers
        );
      }

      /**
       * Only these fields are allowed.
       */
      const allowedFields = new Set([
        'instruction',
        'repository',
        'branch',
        'mode'
      ]);

      if (
        Object.keys(body).some(
          key => !allowedFields.has(key)
        )
      ) {
        return json(
          {
            ok: false,
            error: 'unexpected_field'
          },
          400,
          headers
        );
      }

      /**
       * Instruction validation.
       */
      if (
        typeof body.instruction !== 'string' ||
        !body.instruction.trim()
      ) {
        return json(
          {
            ok: false,
            error: 'instruction_required'
          },
          400,
          headers
        );
      }

      if (
        body.instruction.length >
        MAX_INSTRUCTION_LENGTH
      ) {
        return json(
          {
            ok: false,
            error: 'instruction_too_long',
            max_length:
              MAX_INSTRUCTION_LENGTH
          },
          400,
          headers
        );
      }

      /**
       * Repository validation.
       */
      if (
        body.repository !== undefined &&
        (
          typeof body.repository !== 'string' ||
          body.repository.length > 200 ||
          !validRepository(body.repository)
        )
      ) {
        return json(
          {
            ok: false,
            error: 'invalid_repository'
          },
          400,
          headers
        );
      }

      /**
       * Branch validation.
       */
      if (
        body.branch !== undefined &&
        (
          typeof body.branch !== 'string' ||
          body.branch.length > 200 ||
          !validBranch(body.branch)
        )
      ) {
        return json(
          {
            ok: false,
            error: 'invalid_branch'
          },
          400,
          headers
        );
      }

      /**
       * Mode validation.
       */
      if (
        body.mode !== undefined &&
        (
          typeof body.mode !== 'string' ||
          !MODES.has(body.mode)
        )
      ) {
        return json(
          {
            ok: false,
            error: 'invalid_mode'
          },
          400,
          headers
        );
      }

      /**
       * Generate server-side task ID.
       */
      const taskId =
        crypto.randomUUID();

      const task = {
        taskId,

        instruction:
          body.instruction.trim(),

        mode:
          body.mode || 'audit'
      };

      /**
       * Dispatch to GitHub Actions.
       */
      const dispatched =
        await dispatchCodexTask(
          env,
          task
        );

      if (!dispatched.ok) {
        const status =
          dispatched.error ===
          'github_dispatch_not_configured'
            ? 503
            : 502;

        return json(
          {
            ok: false,
            task_id: taskId,
            ...dispatched
          },
          status,
          headers
        );
      }

      /**
       * Accepted by GitHub Actions.
       */
      return json(
        {
          ok: true,
          accepted: true,

          task_id: taskId,

          mode: task.mode,

          repository: REPOSITORY,

          branch: DEFAULT_BRANCH,

          execution:
            'github-actions-codex',

          workflow:
            CODEX_WORKFLOW
        },
        202,
        headers
      );
    }

    /**
     * ---------------------------------------------------------
     * PRODUCTION MUTATIONS
     * ---------------------------------------------------------
     *
     * Deliberately disabled during Phase 2A.
     */
    if (
      url.pathname ===
        '/v1/production/deploy' ||
      url.pathname ===
        '/v1/production/rollback'
    ) {
      return json(
        {
          ok: false,
          error:
            'production_mutation_disabled',
          message:
            'Deployment and rollback are disabled in Phase 2A.'
        },
        403,
        headers
      );
    }

    /**
     * ---------------------------------------------------------
     * NOT FOUND
     * ---------------------------------------------------------
     */
    return json(
      {
        ok: false,
        error: 'not_found'
      },
      404,
      headers
    );
  }
};
