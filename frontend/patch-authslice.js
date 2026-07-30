const fs = require('fs');
const file = '/Users/mac/Desktop/latest_clone_digital_marketing/ai-digital-marketing-v2/frontend/src/store/slices/authSlice.ts';
let code = fs.readFileSync(file, 'utf8');

// Replace hydrateSession.fulfilled
code = code.replace(
/const storedImpersonated = localStorage.getItem\('admin_impersonated_user'\);\s*if \(storedImpersonated\) \{\s*state.adminUser = \{ \.\.\.action\.payload, permissions: action\.payload\.permissions \|\| \[\] \};\s*state.user = JSON\.parse\(storedImpersonated\);\s*\} else \{\s*state.user\s*= \{ \.\.\.action\.payload, permissions: action\.payload\.permissions \|\| \[\] \};\s*state.adminUser\s*= null;\s*\}/,
`const storedImpersonated = localStorage.getItem('admin_impersonated_user');
        const storedAdmin = localStorage.getItem('admin_original_user');
        
        if (storedImpersonated && storedAdmin) {
          try {
            state.adminUser = JSON.parse(storedAdmin);
          } catch(e) { }
          state.user = { ...action.payload, permissions: action.payload.permissions || [], isImpersonated: true };
        } else {
          state.user            = { ...action.payload, permissions: action.payload.permissions || [] };
          state.adminUser       = null;
        }`
);

// Replace stopImpersonating
code = code.replace(
/stopImpersonating: \(state\) => \{\s*if \(state.adminUser\) \{\s*state.user = state.adminUser;\s*state.adminUser = null;\s*\} else \{\s*const storedAdmin = localStorage.getItem\('admin_original_user'\);\s*if \(storedAdmin\) \{\s*state.user = JSON.parse\(storedAdmin\);\s*\}\s*\}\s*localStorage.removeItem\('admin_impersonated_user'\);\s*localStorage.removeItem\('admin_original_user'\);\s*\}/,
`stopImpersonating: (state) => {
      const storedAdmin = localStorage.getItem('admin_original_user');
      if (storedAdmin) {
        try {
          state.user = JSON.parse(storedAdmin);
        } catch(e) {}
      } else if (state.adminUser) {
        state.user = state.adminUser;
      }
      state.adminUser = null;
      localStorage.removeItem('admin_impersonated_user');
      localStorage.removeItem('admin_original_user');
    }`
);

fs.writeFileSync(file, code);
console.log("Successfully patched authSlice.ts");
