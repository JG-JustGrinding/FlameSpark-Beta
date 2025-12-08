import HeaderClient from './HeaderClient';
import { supabaseServerClient } from '@/lib/supabaseServerClient';

export default async function Header({ isDashboardHeader = false, searchFieldText = "", project = null, onOpenMobileMenu = null, handleLogout = null }) {
  const supabase = await supabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  let avatar = null;
  let username = null;

  if (user) {
    const { data, error } = await supabase
      .from('profiles')
      .select('avatar_url, username')
      .eq('id', user.id)
      .single();
    if (!error && data) {
      avatar = data.avatar_url;
      username = data.username;
    }
  }

  return (
    <HeaderClient initialUser={user} initialAvatar={avatar} initialUsername={username} isDashboardHeader={isDashboardHeader} searchFieldText={searchFieldText} project={project} onOpenMobileMenu={onOpenMobileMenu} handleLogout={handleLogout} />
  );
}